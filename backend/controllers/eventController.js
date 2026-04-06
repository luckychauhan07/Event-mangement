const pool = require("../db/config");
const { getEventDetails } = require("../db/eventQuery");
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
				console.log("OPTIONS:", field.options);
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
	const { id } = req.params;

	if (!id || isNaN(id)) {
		return res.status(400).json({
			success: false,
			message: "Invalid event ID",
		});
	}

	try {
		const query = `
    SELECT 
      e.*,

      -- Coordinators
      COALESCE((
        SELECT json_agg(
          jsonb_build_object(
            'userId', u.user_id,
            'name', u.full_name,
            'email', u.email,
            'phone', u.phone,
            'role', ec.role
          )
        )
        FROM event_coordinators ec
        JOIN users u ON u.user_id = ec.user_id
        WHERE ec.event_id = e.id
      ), '[]') AS coordinators,

      -- Registration Rules
      COALESCE((
        SELECT json_agg(
          jsonb_build_object(
            'allow', r.allow_registration,
            'type', r.registration_type,
            'participation', r.participation_type,
            'start', r.registration_start,
            'end', r.registration_end,
            'limit', r.participant_limit,
            'teamMin', r.min_team_size,
            'teamMax', r.max_team_size
          )
        )
        FROM event_registration_settings r
        WHERE r.event_id = e.id
      ), '[]') AS registration_rules,

      -- Form Fields
      COALESCE((
        SELECT json_agg(
          jsonb_build_object(
            'id', f.field_id,
            'label', f.label,
            'type', f.field_type,
            'required', f.is_required,
            'options', f.options,
            'order', f.display_order
          )
          ORDER BY f.display_order
        )
        FROM event_form_fields f
        WHERE f.event_id = e.id
      ), '[]') AS form_fields

    FROM events e
    WHERE e.id = $1;
    `;

		const result = await pool.query(query, [id]);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Event not found",
			});
		}

		const event = result.rows[0];
		console.log("Raw event data from DB:", event);
		// 🔥 Normalize safely
		const formattedEvent = {
			id: event.id,

			basic: {
				title: event.title,
				subtitle: event.subtitle || null,
				description: event.description,
				category: event.category,
				eventType: event.event_type,
				entryFee: event.entry_fee || 0,
				tags: event.tags || [],
			},

			schedule: {
				startAt: event.start_at,
				endAt: event.end_at,
				mode: event.event_mode,
				venue: event.venue || null,
				onlineLink: event.online_link || null,
			},

			registration: {
				config: {
					required: event.registration_rules[0]?.allow ?? false,
					type: event.registration_rules[0]?.type || null,
					start: event.registration_rules[0]?.start || null,
					end: event.registration_rules[0]?.end || null,
					limit: event.registration_rules[0]?.limit || null,
					participationType:
						event.registration_rules[0]?.participation || null,
				},
				rules: event.registration_rules || [],
			},

			team: {
				enabled:
					event.registration_rules[0]?.participation === "team" &&
					event.registration_rules[0]?.allow
						? true
						: false,
				min: event.registration_rules[0]?.teamMin || null,
				max: event.registration_rules[0]?.teamMax || null,
				joinMode: event.registration_rules[0]?.teamJoinMode || null,
			},

			coordinators: event.coordinators || [],

			formFields: event.form_fields || [],

			stats: {
				totalRegistrations: Number(event.total_registrations) || 0,
				totalTeams: Number(event.total_teams) || 0,
			},

			meta: {
				status: event.status,
				visibility: event.visibility,
				createdAt: event.created_at,
			},
		};
		console.log("Formatted event data:", formattedEvent);
		return res.status(200).json({
			success: true,
			event: formattedEvent,
		});
	} catch (error) {
		console.error("Error fetching event details:", error);

		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

exports.getAllEvents = async (req, res) => {
	console.log(req.body, "Fetching all events");
	try {
		const response = await pool.query(
			`SELECT * FROM events where is_deleted = false ORDER BY created_at DESC`,
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

exports.deleteEvent = async (req, res) => {
	const { id } = req.params;
	console.log("Request to delete event with ID:", id);
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
	console.log("Request to cancel event with ID:", id);
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
