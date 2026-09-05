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
	const eventStatus = req.user.role === "teacher" ? "pending" : "published";
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		// 🧱 1. INSERT EVENT
		const eventRes = await client.query(
			`INSERT INTO events (
			title, subtitle, description, category,
			event_type, entry_fee,
			start_at, end_at,
			event_mode, venue, online_link, status,
			organizer_unit,created_by
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
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
				cleanEventData.onlineLink,
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
			event_id, roles, courses, departments, student_years
		)
		VALUES ($1,$2,$3,$4,$5)`,
			[
				eventId,
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
					resultConfig.type === "position"
						? "simple"
						: resultConfig.type,
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
exports.updateEvent = async (req, res) => {
	const client = await pool.connect();

	try {
		const { id } = req.params;
		const updates = req.body;

		await client.query("BEGIN");

		// ---------------------------------------------------------
		// 1. GET EXISTING EVENT
		// ---------------------------------------------------------
		const existingEvent = await client.query(
			`
			SELECT
				e.id,
				e.title,
				e.status,
				e.is_deleted,
				e.start_at,
				e.event_type,
				rs.registration_start
			FROM events e
			LEFT JOIN event_registration_settings rs
				ON rs.event_id = e.id
			WHERE e.id = $1
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

		// ---------------------------------------------------------
		// 2. BASIC EVENT VALIDATION
		// ---------------------------------------------------------
		if (event.is_deleted) {
			await client.query("ROLLBACK");

			return res.status(400).json({
				message: "Deleted events cannot be edited",
			});
		}

		if (["cancelled", "completed", "rejected"].includes(event.status)) {
			await client.query("ROLLBACK");

			return res.status(400).json({
				message: `Cannot edit ${event.status} events`,
			});
		}

		const startTime = new Date(event.start_at).getTime();

		if (!Number.isFinite(startTime) || startTime <= Date.now()) {
			await client.query("ROLLBACK");

			return res.status(400).json({
				message: "Only upcoming events can be edited",
			});
		}

		// ---------------------------------------------------------
		// 3. GET CURRENT REGISTRATION SETTINGS
		// ---------------------------------------------------------
		const registrationSettingsResult = await client.query(
			`
			SELECT
				allow_registration,
				registration_type,
				registration_start,
				registration_end,
				participation_type,
				participant_limit,
				age_restriction,
				min_team_size,
				max_team_size
			FROM event_registration_settings
			WHERE event_id = $1
			LIMIT 1
			`,
			[id],
		);

		const currentRegistrationSettings =
			registrationSettingsResult.rows[0] || null;

		// ---------------------------------------------------------
		// 4. CURRENT REGISTRATION COUNT
		// ---------------------------------------------------------
		const registrationStats = await client.query(
			`
			SELECT COUNT(*)::int AS total
			FROM event_registrations
			WHERE event_id = $1
			AND status NOT IN ('rejected', 'cancelled')
			`,
			[id],
		);

		const currentRegistrations =
			Number(registrationStats.rows[0]?.total) || 0;

		const registrationStarted =
			currentRegistrations > 0 ||
			(currentRegistrationSettings?.registration_start &&
				new Date(currentRegistrationSettings.registration_start) <=
					new Date());

		// ---------------------------------------------------------
		// 5. DATE VALIDATION
		// ---------------------------------------------------------
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

		// ---------------------------------------------------------
		// 6. PAID EVENT VALIDATION
		// ---------------------------------------------------------
		if (
			updates.eventType === "paid" &&
			(!updates.entryFee || Number(updates.entryFee) <= 0)
		) {
			await client.query("ROLLBACK");

			return res.status(400).json({
				message: "Paid event requires valid entry fee",
			});
		}

		// ---------------------------------------------------------
		// 7. REGISTRATION-STARTED RESTRICTIONS
		// ---------------------------------------------------------
		if (registrationStarted) {
			// Event type cannot change after registration starts
			if (updates.eventType && updates.eventType !== event.event_type) {
				await client.query("ROLLBACK");

				return res.status(400).json({
					message:
						"Cannot change event type after registrations start",
				});
			}

			// Registration limit cannot become smaller
			if (
				updates.registrationLimit !== undefined &&
				updates.registrationLimit !== ""
			) {
				const newLimit = Number(updates.registrationLimit);

				if (
					!Number.isInteger(newLimit) ||
					newLimit < currentRegistrations
				) {
					await client.query("ROLLBACK");

					return res.status(400).json({
						message: `Participant limit cannot be less than current registrations (${currentRegistrations})`,
					});
				}
			}
		}

		// ---------------------------------------------------------
		// 8. NORMALIZE VALUES
		// ---------------------------------------------------------
		const nullable = (value) => {
			if (value === undefined || value === null || value === "") {
				return null;
			}

			return value;
		};

		const nullableNumber = (value) => {
			if (value === undefined || value === null || value === "") {
				return null;
			}

			const number = Number(value);

			return Number.isFinite(number) ? number : null;
		};

		// ---------------------------------------------------------
		// 9. UPDATE EVENTS TABLE
		// ---------------------------------------------------------
		const updatedEvent = await client.query(
			`
			UPDATE events
			SET
				title = COALESCE($1, title),
				subtitle = COALESCE($2, subtitle),
				description = COALESCE($3, description),
				category = COALESCE($4, category),
				event_type = COALESCE($5, event_type),
				entry_fee = $6,

				event_mode = COALESCE($7, event_mode),
				venue = $8,
				online_link = $9,

				start_at = COALESCE($10, start_at),
				end_at = COALESCE($11, end_at)

			WHERE id = $12
			RETURNING *;
			`,
			[
				nullable(updates.title),
				nullable(updates.subtitle),
				nullable(updates.description),
				nullable(updates.category),
				nullable(updates.eventType),

				updates.eventType === "paid"
					? nullableNumber(updates.entryFee)
					: null,

				nullable(updates.eventMode),
				nullable(updates.venue),
				nullable(updates.onlineLink),

				nullable(updates.startAt),
				nullable(updates.endAt),

				id,
			],
		);

		// ---------------------------------------------------------
		// 10. UPDATE COORDINATOR
		// ---------------------------------------------------------
		if (
			updates.coordinator !== undefined &&
			updates.coordinator !== null &&
			updates.coordinator !== ""
		) {
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
				VALUES
					($1, $2, 'primary')
				`,
				[id, Number(updates.coordinator)],
			);
		}

		// ---------------------------------------------------------
		// 11. UPDATE REGISTRATION SETTINGS
		// ---------------------------------------------------------
		const registrationRequired = updates.registrationRequired;

		if (registrationRequired === false) {
			// If registration is disabled, remove the settings row.
			await client.query(
				`
				DELETE FROM event_registration_settings
				WHERE event_id = $1
				`,
				[id],
			);
		} else if (registrationRequired === true) {
			// Registration is enabled.

			const registrationType = nullable(updates.registrationType);

			const registrationStart = nullable(updates.registrationStart);

			const registrationEnd = nullable(updates.registrationEnd);

			const participationType = nullable(
				updates.registrationParticipationType,
			);

			const participantLimit = nullableNumber(updates.registrationLimit);

			const existingSettings = await client.query(
				`
					SELECT event_id
					FROM event_registration_settings
					WHERE event_id = $1
					LIMIT 1
					`,
				[id],
			);

			if (existingSettings.rows.length) {
				await client.query(
					`
					UPDATE event_registration_settings
					SET
						allow_registration = $1,
						registration_type = $2,
						registration_start = $3,
						registration_end = $4,
						participation_type = $5,
						participant_limit = $6
					WHERE event_id = $7
					`,
					[
						true,
						registrationType,
						registrationStart,
						registrationEnd,
						participationType,
						participantLimit,
						id,
					],
				);
			} else {
				await client.query(
					`
					INSERT INTO event_registration_settings (
						event_id,
						allow_registration,
						registration_type,
						registration_start,
						registration_end,
						participation_type,
						participant_limit
					)
					VALUES ($1, $2, $3, $4, $5, $6, $7)
					`,
					[
						id,
						true,
						registrationType,
						registrationStart,
						registrationEnd,
						participationType,
						participantLimit,
					],
				);
			}
		}

		// ---------------------------------------------------------
		// 12. COMMIT
		// ---------------------------------------------------------
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
			error: error.message,
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
	  ,(SELECT row_to_json(rc) FROM event_result_config rc WHERE rc.event_id = e.id) AS result_config
	  ,COALESCE((
		SELECT COUNT(*)::int
		FROM event_registrations er
		WHERE er.event_id = e.id
		  AND er.status NOT IN ('rejected', 'cancelled')
	  ), 0) AS total_registrations
	  ,COALESCE((
		SELECT COUNT(*)::int
		FROM teams t
		WHERE t.event_id = e.id
	  ), 0) AS total_teams

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
			resultConfig: event.result_config || null,

			stats: {
				totalRegistrations: Number(event.total_registrations) || 0,
				totalTeams: Number(event.total_teams) || 0,
			},

			meta: {
				status: event.status,
				visibility: event.visibility,
				createdAt: event.created_at,
				...(req.teacherIsCoordinator !== undefined && {
					teacherIsCoordinator: req.teacherIsCoordinator,
				}),
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

exports.getTeacherEventDetails = async (req, res) => {
	const eventId = Number(req.params.id);
	const teacherId = req.user?.user_id;

	if (!eventId || Number.isNaN(eventId)) {
		return res.status(400).json({
			success: false,
			message: "Invalid event ID",
		});
	}

	if (!teacherId || req.user?.role !== "teacher") {
		return res.status(403).json({
			success: false,
			message: "Only teachers can access this event view",
		});
	}

	try {
		const accessResult = await pool.query(
			`
			SELECT
				e.status,
				e.start_at,
				e.end_at,
				EXISTS (
					SELECT 1
					FROM event_coordinators ec
					WHERE ec.event_id = e.id
						AND ec.user_id = $2
				) AS is_coordinator
			FROM events e
			WHERE e.id = $1
				AND e.is_deleted = false
			LIMIT 1
			`,
			[eventId, teacherId],
		);

		if (accessResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Event not found",
			});
		}

		const event = accessResult.rows[0];
		const now = Date.now();
		const startTime = new Date(event.start_at).getTime();
		const endTime = new Date(event.end_at).getTime();
		const isActiveEvent =
			["published", "upcoming", "approved"].includes(event.status) &&
			Number.isFinite(startTime) &&
			Number.isFinite(endTime) &&
			endTime >= now;

		if (!isActiveEvent && !event.is_coordinator) {
			return res.status(403).json({
				success: false,
				message: "You are not authorized to view this event",
			});
		}

		req.teacherIsCoordinator = Boolean(event.is_coordinator);
		return exports.getEventDetails(req, res);
	} catch (error) {
		console.error("Error authorizing teacher event details:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to load teacher event details",
		});
	}
};

exports.getAllEvents = async (req, res) => {
	console.log(req.body, "Fetching all events");
	try {
		const response = await pool.query(
			`SELECT *
			 FROM events e
			 WHERE is_deleted = false
			 ORDER BY e.created_at DESC`,
		);
		console.log("Fetched events:", response.rows);
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
			`SELECT e.*,
					ec.user_id AS teacher_id,
					u.full_name AS teacher_name,
					u.email AS teacher_email
			 FROM events e
			 JOIN event_coordinators ec ON ec.event_id = e.id
			 JOIN users u ON u.user_id = ec.user_id
			 WHERE e.is_deleted = false
			   AND e.status = 'pending'
			 ORDER BY e.created_at DESC`,
		);

		const activeRequests = response.rows.filter(
			(event) => event.status === "pending" && !isEventExpired(event),
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
			   AND status = 'pending'
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
			   AND status = 'pending'
			 RETURNING id, title, status`,
			[id],
		);

		if (result.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: "Event not found or already processed",
			});
		}

		await pool.query(
			`INSERT INTO event_rejections (event_id, reason, rejected_by)
			 VALUES ($1, $2, $3)`,
			[id, reason?.trim() || "No reason provided", req.user.user_id],
		);

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
			SELECT e.*,
					er.reason AS rejection_reason,
					er.created_at AS rejected_at
			FROM events e
			INNER JOIN event_coordinators ec
				ON e.id = ec.event_id
			LEFT JOIN LATERAL (
				SELECT reason, created_at
				FROM event_rejections
				WHERE event_id = e.id
				ORDER BY created_at DESC
				LIMIT 1
			) er ON true
			WHERE
				ec.user_id = $1
				AND e.is_deleted = false
				AND e.status = 'published'
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

exports.getTeacherEventRequests = async (req, res) => {
	try {
		const response = await pool.query(
			`SELECT e.*,
					er.reason AS rejection_reason,
					er.created_at AS rejected_at
			 FROM events e
			 JOIN event_coordinators ec ON ec.event_id = e.id
			 LEFT JOIN LATERAL (
				 SELECT reason, created_at
				 FROM event_rejections
				 WHERE event_id = e.id
				 ORDER BY created_at DESC
				 LIMIT 1
			 ) er ON true
			 WHERE ec.user_id = $1
			   AND e.is_deleted = false
			   AND e.status IN ('pending', 'rejected')
			 ORDER BY e.created_at DESC`,
			[req.user.user_id],
		);

		return res.json({
			message: "Teacher event requests fetched successfully",
			events: response.rows,
		});
	} catch (error) {
		console.error("Error fetching teacher event requests:", error);
		return res.status(500).json({
			message: "Error fetching teacher event requests",
		});
	}
};

exports.getTeacherProfile = async (req, res) => {
	const teacherId = req.user?.user_id;
	if (!teacherId || req.user?.role !== "teacher") {
		return res.status(403).json({
			success: false,
			message: "Only teachers can access this profile",
		});
	}
	try {
		const result = await pool.query(
			` SELECT user_id, full_name, email, phone, role, status, created_at, updated_at, reject_message FROM users WHERE user_id = $1 AND role = 'teacher' LIMIT 1 `,
			[teacherId],
		);
		if (!result.rows.length) {
			return res
				.status(404)
				.json({ success: false, message: "Teacher profile not found" });
		}
		return res.status(200).json({ success: true, data: result.rows[0] });
	} catch (error) {
		console.error("Error fetching teacher profile:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch teacher profile",
		});
	}
};

exports.updateTeacherProfile = async (req, res) => {
	const teacherId = req.user?.user_id;
	if (!teacherId || req.user?.role !== "teacher") {
		return res.status(403).json({
			success: false,
			message: "Only teachers can update this profile",
		});
	}
	const fullName = String(req.body?.full_name || "").trim();
	const phone = String(req.body?.phone || "").trim() || null;
	if (!fullName) {
		return res
			.status(400)
			.json({ success: false, message: "Full name is required" });
	}
	try {
		const result = await pool.query(
			` UPDATE users SET full_name = $1, phone = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND role = 'teacher' RETURNING user_id, full_name, email, phone, role, status, created_at, updated_at, reject_message `,
			[fullName, phone, teacherId],
		);
		if (!result.rows.length) {
			return res
				.status(404)
				.json({ success: false, message: "Teacher profile not found" });
		}
		return res.status(200).json({
			success: true,
			message: "Teacher profile updated successfully",
			data: result.rows[0],
		});
	} catch (error) {
		console.error("Error updating teacher profile:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to update teacher profile",
		});
	}
};

exports.getAllTeacherEvents = async (req, res) => {
	try {
		const response = await pool.query(
			`
			SELECT e.*
			FROM events e
			WHERE e.is_deleted = false
				AND e.status = 'published'
			ORDER BY e.start_at ASC
			`,
		);
		const now = Date.now();
		const activeEvents = response.rows.filter((event) => {
			const startTime = new Date(event.start_at).getTime();
			const endTime = new Date(event.end_at).getTime();

			if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
				return false;
			}

			return startTime > now || (startTime <= now && endTime >= now);
		});

		res.json({
			message: "All active events fetched successfully",
			events: activeEvents,
		});
	} catch (error) {
		console.error("Error fetching all active events:", error);

		res.status(500).json({
			message: "Error fetching all active events",
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
				AND er.status NOT IN ('rejected', 'cancelled')
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
				AND er.status NOT IN ('rejected', 'cancelled')

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

exports.updateEventRegistrationStatus = async (req, res) => {
	const eventId = Number(req.params.id);
	const registrationId = Number(req.params.registrationId);
	const status = req.body?.status;

	if (!Number.isInteger(eventId) || !Number.isInteger(registrationId)) {
		return res.status(400).json({
			success: false,
			message: "Invalid event or registration ID",
		});
	}
	if (!["approved", "rejected"].includes(status)) {
		return res.status(400).json({
			success: false,
			message: "Registration status must be approved or rejected",
		});
	}

	try {
		const result = await pool.query(
			`UPDATE event_registrations er
			 SET status = $1
			 FROM event_registration_settings rs
			 WHERE er.registration_id = $2
			   AND er.event_id = $3
			   AND rs.event_id = er.event_id
			   AND rs.registration_type = 'approval-based'
			   AND er.status = 'pending'
			   AND EXISTS (
				   SELECT 1
				   FROM event_coordinators ec
				   WHERE ec.event_id = er.event_id
				     AND ec.user_id = $4
			   )
			 RETURNING er.registration_id, er.status`,
			[status, registrationId, eventId, req.user.user_id],
		);

		if (!result.rows.length) {
			return res.status(404).json({
				success: false,
				message:
					"Registration is not pending or you are not the event coordinator",
			});
		}

		return res.json({
			success: true,
			message: `Registration ${status} successfully`,
			registration: result.rows[0],
		});
	} catch (error) {
		console.error("Error updating event registration status:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to update registration status",
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
	const eventId = Number(req.params.id);
	if (!Number.isInteger(eventId)) {
		return res
			.status(400)
			.json({ success: false, message: "Invalid event ID" });
	}

	try {
		const access = await pool.query(
			`SELECT e.id,
				e.created_by,
				EXISTS (
					SELECT 1 FROM event_coordinators ec
					WHERE ec.event_id = e.id AND ec.user_id = $2
				) AS is_coordinator,
				EXISTS (
					SELECT 1 FROM event_registrations er
					WHERE er.event_id = e.id
					  AND er.user_id = $2
					  AND er.status = 'approved'
				) AS is_participant
			 FROM events e
			 WHERE e.id = $1 AND e.is_deleted = false`,
			[eventId, req.user.user_id],
		);
		const event = access.rows[0];
		if (!event) {
			return res
				.status(404)
				.json({ success: false, message: "Event not found" });
		}

		const canView =
			req.user.role === "admin" ||
			Boolean(event.is_coordinator) ||
			Boolean(event.is_participant);
		if (!canView) {
			return res.status(403).json({
				success: false,
				message:
					"Only event participants, coordinators, and admins can view results",
			});
		}

		const result = await pool.query(
			`SELECT er.result_id, er.event_id, er.registration_id, er.team_id,
				er.position, er.rank_label, er.score, er.max_score,
				er.special_award, er.remarks, er.declared_at,
				u.full_name,
				t.team_name
			 FROM event_results er
			 LEFT JOIN event_registrations reg ON reg.registration_id = er.registration_id
			 LEFT JOIN users u ON u.user_id = reg.user_id
			 LEFT JOIN teams t ON t.id = er.team_id
			 WHERE er.event_id = $1
			 ORDER BY er.position ASC NULLS LAST, er.result_id ASC`,
			[eventId],
		);

		return res.json({ success: true, results: result.rows });
	} catch (error) {
		console.error("Error fetching event results:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch event results",
		});
	}
};

exports.createEventResult = async (req, res) => {
	const eventId = Number(req.params.id);
	const results = Array.isArray(req.body?.results) ? req.body.results : [];
	if (!Number.isInteger(eventId) || results.length === 0) {
		return res.status(400).json({
			success: false,
			message: "Event ID and at least one result are required",
		});
	}

	try {
		const eventResult = await pool.query(
			`SELECT e.id,
				e.status,
				e.end_at,
				EXISTS (
					SELECT 1 FROM event_coordinators ec
					WHERE ec.event_id = e.id AND ec.user_id = $2
				) AS is_coordinator
			 FROM events e
			 WHERE e.id = $1 AND e.is_deleted = false`,
			[eventId, req.user.user_id],
		);
		if (!eventResult.rows[0]) {
			return res
				.status(404)
				.json({ success: false, message: "Event not found" });
		}
		if (
			req.user.role !== "teacher" ||
			!eventResult.rows[0].is_coordinator
		) {
			return res.status(403).json({
				success: false,
				message: "Only the event coordinator can declare results",
			});
		}
		const eventHasCompleted =
			eventResult.rows[0].status === "completed" ||
			(eventResult.rows[0].end_at &&
				new Date(eventResult.rows[0].end_at).getTime() <= Date.now());
		if (!eventHasCompleted) {
			return res.status(400).json({
				success: false,
				message:
					"Results can only be declared after the event is completed",
			});
		}

		const config = await pool.query(
			"SELECT positions, team_based FROM event_result_config WHERE event_id = $1",
			[eventId],
		);
		if (!config.rows[0]) {
			return res.status(400).json({
				success: false,
				message: "Result configuration is not enabled for this event",
			});
		}
		if (
			config.rows[0].positions &&
			results.length > config.rows[0].positions
		) {
			return res.status(400).json({
				success: false,
				message: `This event allows only ${config.rows[0].positions} result positions`,
			});
		}

		const positions = results.map((item) => Number(item.position));
		if (new Set(positions).size !== positions.length) {
			return res.status(400).json({
				success: false,
				message: "Each result must use a unique position",
			});
		}
		const selectedParticipants = results.map((item) =>
			item.registrationId
				? `registration:${item.registrationId}`
				: `team:${item.teamId}`,
		);
		if (
			new Set(selectedParticipants).size !== selectedParticipants.length
		) {
			return res.status(400).json({
				success: false,
				message:
					"The same participant cannot receive multiple positions",
			});
		}

		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			await client.query(
				"DELETE FROM event_results WHERE event_id = $1",
				[eventId],
			);

			for (const item of results) {
				const position = toNullableInteger(item.position);
				const registrationId = item.registrationId
					? Number(item.registrationId)
					: null;
				const teamId = item.teamId ? Number(item.teamId) : null;
				if (
					!position ||
					(!registrationId && !teamId) ||
					(registrationId && teamId)
				) {
					throw new Error(
						"Each result needs a position and one valid participant",
					);
				}

				const ownership = await client.query(
					`SELECT 1
					 FROM event_registrations
					 WHERE registration_id = $1
					   AND event_id = $2
					   AND status = 'approved'
					 UNION ALL
					 SELECT 1
					 FROM teams t
					 WHERE t.id = $3
					   AND t.event_id = $2
					   AND EXISTS (
						   SELECT 1 FROM event_registrations er
						   WHERE er.team_id = t.id
							 AND er.event_id = $2
							 AND er.status = 'approved'
					   )`,
					[registrationId, eventId, teamId],
				);
				if (ownership.rowCount === 0) {
					throw new Error(
						"Selected participant does not belong to this event",
					);
				}

				await client.query(
					`INSERT INTO event_results (
						event_id, registration_id, team_id, position,
						rank_label, score, max_score, special_award,
						remarks, declared_by
					) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
					[
						eventId,
						registrationId,
						teamId,
						position,
						item.rankLabel || null,
						item.score || null,
						item.maxScore || null,
						item.specialAward || null,
						item.remarks || null,
						req.user.user_id,
					],
				);
			}

			await client.query("COMMIT");
		} catch (transactionError) {
			await client.query("ROLLBACK");
			throw transactionError;
		} finally {
			client.release();
		}

		return res.status(201).json({
			success: true,
			message: "Event results declared successfully",
		});
	} catch (error) {
		console.error("Error creating event result:", error);
		return res.status(400).json({ success: false, message: error.message });
	}
};
