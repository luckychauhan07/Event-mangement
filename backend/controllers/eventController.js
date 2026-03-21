const pool = require("../db/config");
const { createEventSchema } = require("../validators/eventValidator");

const mapDatabaseError = (error) => {
	switch (error?.code) {
		case "23505":
			return {
				status: 409,
				message: "A duplicate value was found.",
				errors: {
					database: [error.detail || "Duplicate record"],
				},
			};
		case "23503":
			return {
				status: 400,
				message: "A referenced record was not found.",
				errors: {
					database: [error.detail || "Invalid reference"],
				},
			};
		case "23502":
			return {
				status: 400,
				message: "A required value is missing.",
				errors: {
					database: [
						error.column
							? `${error.column} is required`
							: error.detail || "Missing required value",
					],
				},
			};
		case "22P02":
			return {
				status: 400,
				message: "Invalid input format.",
				errors: {
					database: [error.detail || "Invalid value format"],
				},
			};
		case "23514":
			return {
				status: 400,
				message: "One or more values are outside allowed range.",
				errors: {
					database: [error.detail || "Constraint violation"],
				},
			};
		default:
			return null;
	}
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
			for (let i = 0; i < registrationSchema.length; i++) {
				const field = registrationSchema[i];

				await client.query(
					`INSERT INTO event_form_fields (
					event_id, label, field_type, is_required,
					options, display_order
				)
				VALUES ($1,$2,$3,$4,$5,$6)`,
					[
						eventId,
						field.label,
						field.type,
						field.required,
						field.options || [],
						i,
					],
				);
			}
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
			await client.query(
				`INSERT INTO event_result_config (
				event_id, mode, positions, judges_count, criteria
			)
			VALUES ($1,$2,$3,$4,$5)`,
				[
					eventId,
					resultConfig.type,
					Number(resultConfig.positions),
					Number(resultConfig.judgesCount),
					JSON.stringify(resultConfig.criteria || []),
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
	console.log(req.body);
	try {
		const teachers = await pool.query(
			`SELECT full_name AS name, email, phone, user_id
			 FROM users
			 WHERE role = 'teacher'
				AND status = 'active'
			 ORDER BY full_name ASC`,
		);
		console.log("Fetched teachers:", teachers.rows);
		res.json({
			message: "Teachers fetched successfully",
			teachers: teachers.rows,
		});
	} catch (error) {
		console.error("Error fetching teachers:", error);
		res.status(500).json({ message: "Error fetching teachers" });
	}
};

exports.getEventDetails = async (req, res) => {
	const eventId = req.params.id;
	try {
		const response = await pool.query(
			`SELECT * FROM events WHERE id = $1`,
			[eventId],
		);
		if (response.rows.length === 0) {
			return res
				.status(404)
				.json({ message: "Event not found", status: "failure" });
		}
		const eventDetails = response.rows[0];
		res.json({
			message: "Event details fetched successfully",
			event: eventDetails,
			status: "success",
		});
	} catch (error) {
		console.error("Error fetching event details:", error);
		res.status(500).json({
			message: "Internal server error",
			status: "error",
		});
	}
};

exports.getAllEvents = async (req, res) => {
	console.log(req.body, "Fetching all events");
	try {
		const response = await pool.query(
			`SELECT * FROM events ORDER BY created_at DESC`,
		);
		res.json({
			message: "Events fetched successfully",
			events: response.rows,
		});
	} catch (error) {
		console.error("Error fetching events:", error);
		res.status(500).json({ message: "Error fetching events" });
	}
};
