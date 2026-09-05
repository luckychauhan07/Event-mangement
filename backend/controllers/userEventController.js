const pool = require("../db/config");

exports.getAllEvents = async (req, res) => {
	try {
		const currentUserId = req.user?.user_id ?? null;
		let response;

		try {
			response = await pool.query(
				`
				SELECT
					e.*,
					COALESCE(r.allow_registration, false) AS allow_registration,
					r.registration_type,
					r.registration_start,
					r.registration_end,
					COALESCE(r.participation_type, 'individual') AS participation_type,
					COALESCE(r.min_team_size, 1) AS min_team_size,
					COALESCE(r.max_team_size, 1) AS max_team_size,
					er.registration_id AS user_registration_id,
					er.status AS user_registration_status,
					er.submitted_at AS user_registration_submitted_at
				FROM events e
				LEFT JOIN event_registration_settings r
					ON r.event_id = e.id
				LEFT JOIN event_registrations er
					ON er.event_id = e.id
					AND er.user_id = $1
				WHERE e.is_deleted = false
				  AND e.status = 'published'
				  AND (
					e.end_at >= NOW()
					OR er.registration_id IS NOT NULL
				  )
				ORDER BY e.created_at DESC
				`,
				[currentUserId],
			);
		} catch (error) {
			if (error?.code !== "42P01") {
				throw error;
			}

			// Fallback for environments where registrations table is not created yet.
			response = await pool.query(
				`
				SELECT
					e.*,
					COALESCE(r.allow_registration, false) AS allow_registration,
					r.registration_type,
					r.registration_start,
					r.registration_end,
					COALESCE(r.participation_type, 'individual') AS participation_type,
					COALESCE(r.min_team_size, 1) AS min_team_size,
					COALESCE(r.max_team_size, 1) AS max_team_size,
					NULL::BIGINT AS user_registration_id,
					NULL::TEXT AS user_registration_status,
					NULL::TIMESTAMP AS user_registration_submitted_at
				FROM events e
				LEFT JOIN event_registration_settings r
					ON r.event_id = e.id
				WHERE e.is_deleted = false
				  AND e.status = 'published'
				  AND (
					e.end_at >= NOW()
				  )
				ORDER BY e.created_at DESC
				`,
			);
		}

		res.json({
			message: "Events fetched successfully",
			events: response.rows,
		});
	} catch (error) {
		console.error("Error fetching events:", error);
		res.status(500).json({ message: "Error fetching events" });
	}
};

exports.getEventDetails = async (req, res) => {
	const { id } = req.params;
	const currentUserId = req.user?.user_id ?? null;

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
      (SELECT json_agg(jsonb_build_object('userId', u.user_id, 'name', u.full_name, 'email', u.email, 'phone', u.phone, 'role', ec.role)) FROM event_coordinators ec JOIN users u ON u.user_id = ec.user_id WHERE ec.event_id = e.id) AS coordinators,
      (SELECT json_agg(jsonb_build_object('allow', r.allow_registration, 'type', r.registration_type, 'participation', r.participation_type, 'start', r.registration_start, 'end', r.registration_end, 'limit', r.participant_limit, 'teamMin', r.min_team_size, 'teamMax', r.max_team_size)) FROM event_registration_settings r WHERE r.event_id = e.id) AS registration_rules,
      (SELECT json_agg(jsonb_build_object('id', f.field_id, 'label', f.label, 'type', f.field_type, 'required', f.is_required, 'options', f.options, 'order', f.display_order) ORDER BY f.display_order) FROM event_form_fields f WHERE f.event_id = e.id) AS form_fields
			,(SELECT row_to_json(rc) FROM event_result_config rc WHERE rc.event_id = e.id) AS result_config
			,er.registration_id AS user_registration_id
			,er.status AS user_registration_status
			,er.submitted_at AS user_registration_submitted_at
    FROM events e
		LEFT JOIN event_registrations er
			ON er.event_id = e.id
			AND er.user_id = $2
    WHERE e.id = $1;
    `;

		const result = await pool.query(query, [id, currentUserId]);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Event not found",
			});
		}

		const event = result.rows[0];
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
					required: event.registration_rules?.[0]?.allow ?? false,
					type: event.registration_rules?.[0]?.type || null,
					start: event.registration_rules?.[0]?.start || null,
					end: event.registration_rules?.[0]?.end || null,
					limit: event.registration_rules?.[0]?.limit || null,
					participationType:
						event.registration_rules?.[0]?.participation || null,
				},
				rules: event.registration_rules || [],
			},
			team: {
				enabled:
					event.registration_rules?.[0]?.participation === "team" &&
					event.registration_rules?.[0]?.allow,
				min: event.registration_rules?.[0]?.teamMin || null,
				max: event.registration_rules?.[0]?.teamMax || null,
				joinMode: event.registration_rules?.[0]?.teamJoinMode || null,
			},
			coordinators: event.coordinators || [],
			formFields: event.form_fields || [],
			resultConfig: event.result_config || null,
			user_registration_id: event.user_registration_id,
			user_registration_status: event.user_registration_status,
			user_registration_submitted_at:
				event.user_registration_submitted_at,
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
		return res.status(200).json({ success: true, event: formattedEvent });
	} catch (error) {
		console.error("Error fetching event details:", error);
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
	}
};
