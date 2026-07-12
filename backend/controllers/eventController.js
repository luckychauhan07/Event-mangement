const { createEventSchema } = require("../validators/eventValidator");
const pool = require("../db/config");
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

const isEventExpired = (event) => {
	if (!event?.end_at) return false;
	const endTime = new Date(event.end_at).getTime();
	if (Number.isNaN(endTime)) return false;
	return endTime < Date.now();
};

exports.addEvent = async (req, res) => {
	console.log("Received request to add event:", req.user);
	if (!req.user || !req.user.user_id) {
		return res.status(401).json({
			message: "Unauthorized: User information is missing.",
		});
	}
	const parsed = createEventSchema.safeParse(req.body);
	if (!parsed.success) {
		// Zod's .flatten() method perfectly formats the errors for React
		const flattened = parsed.error.flatten();
		console.log("Validation errors:", flattened);

		return res.status(401).json({
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
	const eventStatus = req.user.role === "teacher" ? "draft" : "published";
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		// 🧱 1. INSERT EVENT
		const eventRes = await client.query(
			`INSERT INTO events (
			title, subtitle, description, category,
			event_type, entry_fee,
			start_at, end_at,
			event_mode, venue,status,
			organizer_unit,created_by
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
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
				eventStatus,
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
	console.log(req.body, req.user, "Fetching all teachers");
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
	console.log(req.body, `Fetching details for event ID: ${id}`);
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
				organizerUnit: event.organizer_unit || null,
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
			`SELECT *
			 FROM events
			 WHERE is_deleted = false
			 ORDER BY created_at DESC`,
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

exports.getPendingEventRequests = async (req, res) => {
	console.log(req.body, "Fetching pending event requests");
	try {
		const response = await pool.query(
			`SELECT *
			 FROM events
			 WHERE is_deleted = false
			   AND status = 'draft'
			 ORDER BY created_at DESC`,
		);

		const activeRequests = response.rows.filter(
			(event) => event.status === "draft" && !isEventExpired(event),
		);

		res.json({
			message: "Pending events fetched successfully",
			events: activeRequests,
		});
	} catch (error) {
		console.error("Error fetching pending events:", error);
		res.status(500).json({ message: "Error fetching pending events" });
	}
};

exports.approveEventRequest = async (req, res) => {
	const { id } = req.params;
	if (!id || isNaN(id)) {
		return res.status(400).json({
			success: false,
			message: "Invalid event ID",
		});
	}

	try {
		const result = await pool.query(
			`UPDATE events
			 SET status = 'published', updated_at = NOW()
			 WHERE id = $1
			   AND is_deleted = false
			   AND status = 'draft'
			 RETURNING id, title, status`,
			[id],
		);

		if (result.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: "Event not found or already processed",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Event approved successfully",
			event: result.rows[0],
		});
	} catch (error) {
		console.error("Error approving event:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to approve event",
		});
	}
};

exports.rejectEventRequest = async (req, res) => {
	const { id } = req.params;
	const { reason } = req.body;

	if (!id || isNaN(id)) {
		return res.status(400).json({
			success: false,
			message: "Invalid event ID",
		});
	}

	try {
		const result = await pool.query(
			`UPDATE events
			 SET status = 'rejected', updated_at = NOW()
			 WHERE id = $1
			   AND is_deleted = false
			   AND status = 'draft'
			 RETURNING id, title, status`,
			[id],
		);

		if (result.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: "Event not found or already processed",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Event rejected successfully",
			reason: reason || "No reason provided",
			event: result.rows[0],
		});
	} catch (error) {
		console.error("Error rejecting event:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to reject event",
		});
	}
};

exports.getTeacherEvents = async (req, res) => {
	try {
		const teacherId = req.user.user_id;

		const response = await pool.query(
			`
			SELECT e.*
			FROM events e
			INNER JOIN event_coordinators ec
				ON e.id = ec.event_id
			WHERE
				ec.user_id = $1
				AND e.is_deleted = false
			ORDER BY e.created_at DESC
			`,
			[teacherId],
		);

		res.json({
			message: "Teacher events fetched successfully",
			events: response.rows,
		});
	} catch (error) {
		console.error("Error fetching teacher events:", error);

		res.status(500).json({
			message: "Error fetching teacher events",
		});
	}
};

exports.getTeacherDashboard = async (req, res) => {
	try {
		const teacherId = req.user.user_id;

		const eventsQuery = `
			SELECT
				e.*,
				ec.role,
				COUNT(DISTINCT er.registration_id) AS registrations
			FROM events e
			JOIN event_coordinators ec
				ON e.id = ec.event_id
			LEFT JOIN event_registrations er
				ON er.event_id = e.id
			WHERE
				ec.user_id = $1
				AND e.is_deleted = false
			GROUP BY e.id, ec.role
			ORDER BY e.created_at DESC;
		`;

		const statsQuery = `
			SELECT
				COUNT(DISTINCT e.id) AS assigned_events,

				COUNT(
					DISTINCT CASE
						WHEN e.status = 'published' THEN e.id
					END
				) AS active_events,

				COUNT(DISTINCT er.registration_id) AS total_registrations,

				COUNT(
					DISTINCT CASE
						WHEN er.status = 'pending' THEN er.registration_id
					END
				) AS pending_registrations

			FROM event_coordinators ec

			JOIN events e
				ON e.id = ec.event_id

			LEFT JOIN event_registrations er
				ON er.event_id = e.id

			WHERE
				ec.user_id = $1
				AND e.is_deleted = false;
		`;

		const [statsResult, eventsResult] = await Promise.all([
			pool.query(statsQuery, [teacherId]),
			pool.query(eventsQuery, [teacherId]),
		]);

		return res.status(200).json({
			success: true,
			stats: statsResult.rows[0],
			events: eventsResult.rows,
		});
	} catch (error) {
		console.error("Error loading teacher dashboard:", error);

		return res.status(500).json({
			success: false,
			message: "Failed to load dashboard",
		});
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

exports.getAllDetailsForEvent = async (req, res) => {
	const { id } = req.params;
	if (!id || isNaN(id)) {
		return res.status(400).json({
			success: false,
			message: "Invalid event ID",
		});
	}
	try {
		const details = await pool.query(
			`SELECT 
				e.id, e.title, e.subtitle, e.description, e.category,
				e.event_type, e.entry_fee, e.start_at, e.end_at,
				e.event_mode, e.venue, e.organizer_unit,
				e.status, e.visibility, e.created_at,
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
				), '[]') AS registration_settings
			FROM events e
			WHERE e.id = $1`,
		);
		console.log(details);
		// return res.status(200).json({
		// 	success: true,
		// 	details,
		// });
	} catch (error) {
		console.error("Error fetching event details:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

exports.updateEvent = async (req, res) => {
	const client = await pool.connect();

	try {
		const { id } = req.params;
		const updates = req.body;

		await client.query("BEGIN");
		const existingEvent = await client.query(
			`
			SELECT 
				id,
				title,
				status,
				is_deleted,
				participant_limit,
				event_type,
				registration_start,
				registration_end
			FROM events
			WHERE id = $1
			`,
			[id],
		);

		if (!existingEvent.rows.length) {
			await client.query("ROLLBACK");
			return res.status(404).json({
				message: "Event not found",
			});
		}

		const event = existingEvent.rows[0];

		if (event.is_deleted) {
			await client.query("ROLLBACK");
			return res.status(400).json({
				message: "Deleted events cannot be edited",
			});
		}

		if (event.status === "cancelled" || event.status === "completed") {
			await client.query("ROLLBACK");
			return res.status(400).json({
				message: `Cannot edit ${event.status} events`,
			});
		}

		const registrationStats = await client.query(
			`
			SELECT COUNT(*)::int AS total
			FROM event_registrations
			WHERE event_id = $1
			AND status IN ('registered','confirmed')
			`,
			[id],
		);

		const currentRegistrations = registrationStats.rows[0].total || 0;

		const registrationStarted =
			currentRegistrations > 0 ||
			(event.registration_start &&
				new Date(event.registration_start) <= new Date());

		// Date validation
		if (
			updates.startAt &&
			updates.endAt &&
			new Date(updates.startAt) >= new Date(updates.endAt)
		) {
			await client.query("ROLLBACK");
			return res.status(400).json({
				message: "End date must be after start date",
			});
		}

		// Paid event validation
		if (
			updates.eventType === "paid" &&
			(!updates.entryFee || Number(updates.entryFee) <= 0)
		) {
			await client.query("ROLLBACK");
			return res.status(400).json({
				message: "Paid event requires valid entry fee",
			});
		}

		if (registrationStarted) {
			// cannot change event type
			if (updates.eventType && updates.eventType !== event.event_type) {
				await client.query("ROLLBACK");
				return res.status(400).json({
					message:
						"Cannot change event type after registrations start",
				});
			}

			// participant limit rule
			if (updates.participantLimit !== undefined) {
				const newLimit = Number(updates.participantLimit);

				if (newLimit < currentRegistrations) {
					await client.query("ROLLBACK");
					return res.status(400).json({
						message: `Participant limit cannot be less than current registrations (${currentRegistrations})`,
					});
				}
			}
		}

		const updatedEvent = await client.query(
			`
			UPDATE events
			SET
				title = COALESCE($1, title),
				subtitle = COALESCE($2, subtitle),
				description = COALESCE($3, description),
				category = COALESCE($4, category),
				event_type = COALESCE($5, event_type),
				entry_fee = COALESCE($6, entry_fee),

				event_mode = COALESCE($7, event_mode),
				venue = COALESCE($8, venue),
				online_link = COALESCE($9, online_link),

				start_at = COALESCE($10, start_at),
				end_at = COALESCE($11, end_at),

				participant_limit = COALESCE($12, participant_limit),

				updated_at = NOW()

			WHERE id = $13
			RETURNING *;
			`,
			[
				updates.title ?? null,
				updates.subtitle ?? null,
				updates.description ?? null,
				updates.category ?? null,
				updates.eventType ?? null,
				updates.entryFee ?? null,

				updates.eventMode ?? null,
				updates.venue ?? null,
				updates.onlineLink ?? null,

				updates.startAt ?? null,
				updates.endAt ?? null,

				updates.participantLimit ?? null,

				id,
			],
		);

		if (updates.coordinator) {
			await client.query(
				`
				DELETE FROM event_coordinators
				WHERE event_id = $1
				`,
				[id],
			);

			await client.query(
				`
				INSERT INTO event_coordinators
				(event_id, user_id, role)
				VALUES ($1, $2, 'primary')
				`,
				[id, updates.coordinator],
			);
		}

		await client.query("COMMIT");

		return res.status(200).json({
			message: "Event updated successfully",
			event: updatedEvent.rows[0],
		});
	} catch (error) {
		await client.query("ROLLBACK");

		console.error("Update Event Error:", error);

		return res.status(500).json({
			message: "Failed to update event",
		});
	} finally {
		client.release();
	}
};

exports.getEventRegistrations = async (req, res) => {
	try {
		const { id } = req.params;

		const query = `
SELECT
    er.registration_id,
    er.status,
    er.submitted_at,

    u.user_id,
    u.full_name,
    u.email,
    u.phone,

    t.id AS team_id,
    t.team_name AS team_name

FROM event_registrations er

JOIN users u
    ON u.user_id = er.user_id

LEFT JOIN teams t
    ON t.id = er.team_id

WHERE er.event_id = $1

ORDER BY er.submitted_at DESC;
`;

		const result = await pool.query(query, [id]);

		return res.status(200).json({
			success: true,
			registrations: result.rows,
		});
	} catch (error) {
		console.error("Error fetching registrations:", error);

		return res.status(500).json({
			success: false,
			message: "Failed to fetch registrations",
		});
	}
};

exports.getEventTeams = async (req, res) => {
	try {
		const { id } = req.params;

		const query = `
SELECT
    t.id AS team_id,
    t.team_name,
    t.created_at,
    COUNT(tm.user_id) AS member_count

FROM teams t

LEFT JOIN team_members tm
    ON tm.team_id = t.id

WHERE t.event_id = $1

GROUP BY
    t.id,
    t.team_name,
    t.created_at

ORDER BY t.created_at DESC;
`;

		const result = await pool.query(query, [id]);

		return res.status(200).json({
			success: true,
			teams: result.rows,
		});
	} catch (error) {
		console.error("Error fetching teams:", error);

		return res.status(500).json({
			success: false,
			message: "Failed to fetch teams",
		});
	}
};

exports.getEventResults = async (req, res) => {
	return res.status(200).json({
		success: true,
		results: [],
	});
};

exports.createEventResult = async (req, res) => {
	return res.status(501).json({
		success: false,
		message: "Result module is not implemented yet.",
	});
};
