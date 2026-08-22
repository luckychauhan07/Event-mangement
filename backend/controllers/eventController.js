const pool = require("../db/config");
const { createEventSchema } = require("../validators/eventValidator");
const { mapDatabaseError } = require("../utils/dbHelpers");

const toNullableInteger = (value) => {
	if (value === "" || value === null || value === undefined) {
		return null;
	}

	const parsedValue = Number(value);
	if (!Number.isFinite(parsedValue) || !Number.isInteger(parsedValue)) {
		return null;
	}

	return parsedValue;
};

exports.addEvent = async (req, res) => {
	const parsed = createEventSchema.safeParse(req.body);
	if (!parsed.success) {
		// Zod's .flatten() method perfectly formats the errors for React
		const flattened = parsed.error.flatten();
		return res.status(400).json({
			message: "Please check the form for errors.",
			errors: flattened.fieldErrors,
			formErrors: flattened.formErrors,
		});
	}

	const eventData = parsed.data;
	const {
		registrationSchema,
		resultConfig,
		primaryCoordinatorId,
		...cleanEventData
	} = eventData;

	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		// 🧱 1. INSERT EVENT
		const eventRes = await client.query(
			`INSERT INTO events (
			title, subtitle, description, category,
			event_type, entry_fee,
			start_at, end_at,
			event_mode, venue,
			organizer_unit,created_by
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
		RETURNING id`,
			[
				cleanEventData.title,
				cleanEventData.subtitle,
				cleanEventData.description,
				cleanEventData.category,
				cleanEventData.eventType,
				cleanEventData.eventType === "paid"
					? Number(cleanEventData.entryFee)
					: null,
				cleanEventData.startAt,
				cleanEventData.endAt,
				cleanEventData.eventMode,
				cleanEventData.venue,
				cleanEventData.organizerUnit,
				req.user.user_id, // created_by
			],
		);

		const eventId = eventRes.rows[0].id;

		// 🧱 2. COORDINATOR
		await client.query(
			`INSERT INTO event_coordinators (event_id, user_id)
		 VALUES ($1, $2)`,
			[eventId, Number(primaryCoordinatorId)],
		);

		// 🧱 3. REGISTRATION SETTINGS
		if (cleanEventData.allowRegistration) {
			await client.query(
				`INSERT INTO event_registration_settings (
				event_id, allow_registration, registration_type,
				registration_start, registration_end,
				participation_type, min_team_size, max_team_size
			)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
				[
					eventId,
					true,
					cleanEventData.registrationType,
					cleanEventData.registrationStart,
					cleanEventData.registrationEnd,
					cleanEventData.participationType,
					cleanEventData.minTeamSize,
					cleanEventData.maxTeamSize,
				],
			);
		}

		// 🧱 4. REGISTRATION FORM FIELDS
		if (registrationSchema?.length) {
			const allowedTypes = [
				"text",
				"textarea",
				"email",
				"number",
				"tel",
				"url",
				"date",
				"select",
				"checkbox",
				"file",
			];

			const values = [];
			const placeholders = [];

			registrationSchema.forEach((field, index) => {
				// 🔒 Validate type
				if (!allowedTypes.includes(field.type)) {
					throw new Error(`Invalid field type: ${field.type}`);
				}
				const serializedOptions = JSON.stringify(
					Array.isArray(field.options) ? field.options : [],
				);
				values.push(
					eventId,
					field.label,
					field.type,
					field.required ?? false,
					serializedOptions,
					index + 1, // better ordering
				);

				const baseIndex = index * 6;

				placeholders.push(
					`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}::jsonb, $${baseIndex + 6})`,
				);
			});

			await client.query(
				`
				INSERT INTO event_form_fields (
					event_id, label, field_type, is_required,
					options, display_order
				)
				VALUES ${placeholders.join(", ")}
				`,
				values,
			);
		}

		// 🧱 5. AUDIENCE
		await client.query(
			`INSERT INTO event_audience (
			event_id, inter_college,
			roles, courses, departments, student_years
		)
		VALUES ($1,$2,$3,$4,$5,$6)`,
			[
				eventId,
				cleanEventData.interCollege === "yes",
				cleanEventData.audienceRoles || [],
				[cleanEventData.course],
				[cleanEventData.department],
				cleanEventData.studentYears || [],
			],
		);

		// 🧱 6. RESULT CONFIG
		if (resultConfig?.enabled) {
			const normalizedPositions = toNullableInteger(
				resultConfig.positions,
			);
			const normalizedJudgesCount = toNullableInteger(
				resultConfig.judgesCount,
			);

			await client.query(
				`INSERT INTO event_result_config (
				event_id, mode, positions, judges_count, criteria
			)
			VALUES ($1,$2,$3,$4,$5)`,
				[
					eventId,
					resultConfig.type,
					normalizedPositions,
					normalizedJudgesCount,
					resultConfig.criteria || [],
				],
			);
		}

		// 🔥 COMMIT
		await client.query("COMMIT");

		return res.status(201).json({
			message: "Event created successfully!",
			eventId,
			status: "success",
		});
	} catch (error) {
		try {
			await client.query("ROLLBACK");
		} catch (rollbackError) {
			console.error("Rollback failed:", rollbackError);
		}

		console.error("Error creating event:", error);
		const mappedDatabaseError = mapDatabaseError(error);
		if (mappedDatabaseError) {
			return res.status(mappedDatabaseError.status).json({
				message: mappedDatabaseError.message,
				errors: mappedDatabaseError.errors,
			});
		}

		return res.status(500).json({
			message: "Internal server error while creating event",
			errors: {
				server: ["Unexpected server error"],
			},
		});
	} finally {
		client.release();
	}
};

exports.getAllTeachers = async (req, res) => {
	try {
		const teachers = await pool.query(
			`SELECT full_name AS name, email, phone, user_id
			 FROM users
			 WHERE role = 'teacher'
				AND status = 'active'
			 ORDER BY full_name ASC`,
		);
		res.json({
			message: "Teachers fetched successfully",
			teachers: teachers.rows,
		});
	} catch (error) {
		console.error("Error fetching teachers:", error);
		res.status(500).json({ message: "Error fetching teachers" });
	}
};

exports.deleteEvent = async (req, res) => {
	const { id } = req.params;
	if (!id || isNaN(id)) {
		return res.status(400).json({
			success: false,
			message: "Invalid event ID",
		});
	}
	try {
		const result = await pool.query(
			"UPDATE events SET is_deleted = true, updated_at = NOW() WHERE id = $1",
			[id],
		);
		if (result.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: "Event not found",
			});
		}
		return res.status(200).json({
			success: true,
			message: "Event deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting event:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

exports.cancelEvent = async (req, res) => {
	const { id } = req.params;
	if (!id || isNaN(id)) {
		return res.status(400).json({
			success: false,
			message: "Invalid event ID",
		});
	}
	try {
		const result = await pool.query(
			`UPDATE events SET status = 'cancelled' WHERE id = $1 AND status != 'cancelled'`,
			[id],
		);
		if (result.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: "Event not found or already cancelled",
			});
		}
		return res.status(200).json({
			success: true,
			message: "Event cancelled successfully",
		});
	} catch (error) {
		console.error("Error cancelling event:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};
