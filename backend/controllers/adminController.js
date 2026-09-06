const pool = require("../db/config");

exports.getDashboardSummary = async (req, res) => {
	try {
		const [
			users,
			pendingTeachers,
			events,
			pendingEvents,
			registrations,
			recentEvents,
		] = await Promise.all([
			pool.query("SELECT COUNT(*)::int AS total FROM users"),
			pool.query(
				"SELECT COUNT(*)::int AS total FROM users WHERE role = 'teacher' AND status = 'pending'",
			),
			pool.query(
				"SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE start_at > NOW() AND status = 'published')::int AS upcoming FROM events WHERE is_deleted = false",
			),
			pool.query(
				"SELECT COUNT(*)::int AS total FROM events WHERE status = 'pending' AND is_deleted = false",
			),
			pool.query(
				"SELECT COUNT(*)::int AS total FROM event_registrations WHERE status NOT IN ('rejected', 'cancelled')",
			),
			pool.query(`SELECT id, title, category, status, start_at
					FROM events
					WHERE is_deleted = false
					ORDER BY created_at DESC
					LIMIT 5`),
		]);

		return res.status(200).json({
			success: true,
			stats: {
				totalUsers: users.rows[0].total,
				pendingTeachers: pendingTeachers.rows[0].total,
				totalEvents: events.rows[0].total,
				upcomingEvents: events.rows[0].upcoming,
				pendingEvents: pendingEvents.rows[0].total,
				totalRegistrations: registrations.rows[0].total,
			},
			recentEvents: recentEvents.rows,
		});
	} catch (error) {
		console.error("Error loading admin dashboard:", error);
		return res
			.status(500)
			.json({ success: false, message: "Failed to load dashboard data" });
	}
};

exports.getAllEvents = async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT e.*,
					COALESCE((
						SELECT COUNT(*)::int
						FROM event_registrations er
						WHERE er.event_id = e.id
						  AND er.status NOT IN ('rejected', 'cancelled')
					), 0) AS total_registrations
			 FROM events e
			 WHERE e.is_deleted = false
			 ORDER BY e.created_at DESC`,
		);

		return res.status(200).json({
			success: true,
			message: "All events fetched successfully",
			events: result.rows,
		});
	} catch (error) {
		console.error("Error fetching admin events:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch events",
		});
	}
};

exports.getPendingTeachers = async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT user_id, full_name, email, phone
       FROM users
       WHERE role='teacher'
       AND status='pending'
       ORDER BY created_at DESC`,
		);

		res.json({
			success: true,
			data: result.rows,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch pending teachers",
		});
	}
};

exports.teacherAction = async (req, res) => {
	try {
		const { id } = req.params;
		const { action, reason } = req.body;
		// incoming parameters
		if (action === "reject") {
			const rejectReason = reason || "No reason provided";
			const result = await pool.query(
				`UPDATE users
				SET status='rejected'
				WHERE user_id=$1`,
				[id],
			);
			await pool.query(
				`INSERT INTO teacher_rejections (user_id, reason)
					VALUES ($1, $2)`,
				[id, rejectReason],
			);
			res.status(200).json({
				success: true,
				message: "Teacher rejected successfully",
			});
			return;
		} else if (action === "approve") {
			await pool.query(
				`UPDATE users
				SET status='active'
				WHERE user_id=$1`,
				[id],
			);
			res.status(200).json({
				success: true,
				message: "Teacher approved successfully",
			});
			return;
		} else {
			return res.status(400).json({
				success: false,
				message: "Invalid action",
			});
		}
	} catch (err) {
		// Log the error for debugging
		console.error("Error in teacherAction:", err);
		res.status(500).json({
			success: false,
			message: "Action failed",
		});
	}
};

exports.getUsers = async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT user_id, full_name, email, phone, role, status
       FROM users
       ORDER BY created_at DESC`,
		);

		res.json({
			success: true,
			data: result.rows,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch users",
		});
	}
};

exports.getUserDetails = async (req, res) => {
	const { id } = req.params;

	try {
		const result = await pool.query(
			`SELECT user_id, full_name, email, phone, role, status
			FROM users
			WHERE user_id = $1`,
			[id],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		res.json({
			success: true,
			data: result.rows[0],
		});
	} catch (err) {
		console.error("Error fetching user details:", err); // Log the error for debugging
		res.status(500).json({
			success: false,
			message: "Failed to fetch user details",
		});
	}
};

exports.deleteUser = async (req, res) => {
	const id = Number(req.params.id);

	if (!id || isNaN(id)) {
		return res.status(400).json({
			success: false,
			message: "Invalid user ID",
		});
	}

	try {
		const userResult = await pool.query(
			`SELECT user_id, status, role FROM users WHERE user_id = $1`,
			[id],
		);
		if (userResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}
		if (userResult.rows[0].role === "admin") {
			return res.status(403).json({
				success: false,
				message: "Cannot delete an admin user",
			});
		}
		if (userResult.rows[0].status === "active") {
			return res.status(400).json({
				success: false,
				message:
					"Active user cannot be deleted. Please deactivate the user first.",
			});
		}
		const result = await pool.query(
			`DELETE FROM users WHERE user_id = $1`,
			[id],
		);
		return res.status(200).json({
			success: true,
			message: "User deleted successfully",
		});
	} catch (err) {
		console.error("Delete user error:", err);
		res.status(500).json({
			success: false,
			message: "Failed to delete user",
		});
	}
};

exports.changeUserStatus = async (req, res) => {
	const id = Number(req.params.id);
	const { action } = req.body;

	if (!id || isNaN(id)) {
		return res.status(400).json({
			success: false,
			message: "Invalid user ID",
		});
	}

	const allowedActions = ["deactivate", "activate"];

	if (!allowedActions.includes(action)) {
		return res.status(400).json({
			success: false,
			message: "Invalid action",
		});
	}

	try {
		const userResult = await pool.query(
			`SELECT user_id, status, role FROM users WHERE user_id = $1`,
			[id],
		);

		if (userResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		const user = userResult.rows[0];

		if (user.role === "admin") {
			return res.status(403).json({
				success: false,
				message: "Cannot change status of an admin user",
			});
		}

		if (action === "deactivate") {
			if (user.status === "inactive") {
				return res.status(400).json({
					success: false,
					message: "User is already inactive",
				});
			}

			if (user.status === "pending") {
				return res.status(400).json({
					success: false,
					message: "Cannot deactivate a pending user",
				});
			}

			if (user.status === "rejected") {
				return res.status(400).json({
					success: false,
					message: "Rejected user cannot be deactivated",
				});
			}

			if (user.status === "active") {
				await pool.query(
					`
					UPDATE users
					SET status = 'inactive',
					    updated_at = CURRENT_TIMESTAMP
					WHERE user_id = $1
					`,
					[id],
				);

				return res.status(200).json({
					success: true,
					message: "User deactivated successfully",
				});
			}
		}
		if (action === "activate") {
			if (user.status === "active") {
				return res.status(400).json({
					success: false,
					message: "User is already active",
				});
			}
			if (user.status === "pending") {
				return res.status(400).json({
					success: false,
					message: "Cannot activate a pending user",
				});
			}
			if (user.status === "rejected") {
				return res.status(400).json({
					success: false,
					message: "Rejected user cannot be activated",
				});
			}
			if (user.status === "inactive") {
				await pool.query(
					`
					UPDATE users
					SET status = 'active',
					    updated_at = CURRENT_TIMESTAMP
					WHERE user_id = $1
					`,
					[id],
				);
				return res.status(200).json({
					success: true,
					message: "User activated successfully",
				});
			}
		}
		return res.status(400).json({
			success: false,
			message: "Invalid status transition",
		});
	} catch (err) {
		console.error("Change user status error:", err);
		return res.status(500).json({
			success: false,
			message: "Failed to change user status",
		});
	}
};

exports.updateUser = async (req, res) => {
	const id = Number(req.params.id);
	const { full_name, email, phone } = req.body;

	if (!id || isNaN(id)) {
		return res.status(400).json({
			success: false,
			message: "Invalid user ID",
		});
	}

	if (!full_name || !email) {
		return res.status(400).json({
			success: false,
			message: "Full name and email are required",
		});
	}
	const emailDuplicateCheck = await pool.query(
		`SELECT user_id FROM users WHERE email = $1 AND user_id != $2`,
		[email, id],
	);
	if (emailDuplicateCheck.rows.length > 0) {
		return res.status(400).json({
			success: false,
			message: "user already exists with this email",
		});
	}

	try {
		const userResult = await pool.query(
			`SELECT user_id FROM users WHERE user_id = $1`,
			[id],
		);

		if (userResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		await pool.query(
			`
			UPDATE users
			SET full_name = $1,
			    email = $2,
			    phone = $3,
			    updated_at = CURRENT_TIMESTAMP
			WHERE user_id = $4
			`,
			[full_name, email, phone, id],
		);

		return res.status(200).json({
			success: true,
			message: "User updated successfully",
		});
	} catch (err) {
		console.error("Update user error:", err);
		return res.status(500).json({
			success: false,
			message: "Failed to update user",
		});
	}
};

exports.getAdminProfile = async (req, res) => {
	try {
		const { user_id } = req.user;
		const result = await pool.query(
			`SELECT
					-- =========================
					-- USER CORE INFO
					-- =========================
					u.user_id,
					u.full_name,
					u.email,
					u.phone,
					u.role,
					u.status,
					u.created_at AS account_created_at,
					u.updated_at AS account_updated_at,

					-- =========================
					-- PROFILE COMPLETION STATUS
					-- =========================
					CASE
						WHEN
							u.full_name IS NOT NULL
							AND u.email IS NOT NULL
							AND ap.designation IS NOT NULL
							AND ap.institution_id IS NOT NULL
						THEN TRUE
						ELSE FALSE
					END AS profile_completed,

					-- =========================
					-- ADMIN PROFILE
					-- =========================
					ap.designation,
					ap.department,
					ap.employee_code,
					ap.alternate_email,
					ap.office_phone,
					ap.office_location,
					ap.signature_image_url,
					ap.joined_on,
					ap.institution_id,
					ap.created_at AS admin_profile_created_at,
					ap.updated_at AS admin_profile_updated_at,

					-- =========================
					-- INSTITUTION INFO
					-- =========================
					i.institution_name,
					i.logo_url AS institution_logo_url,
					i.banner_url AS institution_banner_url,
					i.address,
					i.city,
					i.state,
					i.country,
					i.pincode,
					i.contact_email AS institution_contact_email,
					i.contact_phone AS institution_contact_phone,
					i.website,
					i.principal_name,
					i.academic_year,
					i.updated_at AS institution_updated_at
				FROM users u
				LEFT JOIN admin_profiles ap
					ON ap.admin_id = u.user_id
				LEFT JOIN institution_settings i
					ON i.institution_id = ap.institution_id

				WHERE u.user_id = $1
				AND u.role = 'admin'
				LIMIT 1;`,
			[user_id],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Admin profile not found",
			});
		}

		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (err) {
		console.error("Get admin profile error:", err);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch admin profile",
		});
	}
};

exports.getAdminProfileSummary = async (req, res) => {
	try {
		const { user_id } = req.user;
		const result = await pool.query(
			`SELECT
				u.full_name,
				u.email,
				u.phone,		

				ap.designation,
				ap.office_phone,
				ap.alternate_email,
				ap.office_location,
				ap.signature_image_url,
				ap.institution_id,
				ap.employee_code AS employee_id

			FROM users u
			LEFT JOIN admin_profiles ap
				ON ap.admin_id = u.user_id

			WHERE u.user_id = $1
			AND u.role = 'admin'
			LIMIT 1`,
			[user_id],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Admin profile not found",
			});
		}

		return res.status(200).json({
			success: true,
			data: result.rows[0],
		});
	} catch (err) {
		console.error("Get admin profile error:", err);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch admin profile",
		});
	}
};

exports.updateAdminProfile = async (req, res) => {
	const client = await pool.connect();

	try {
		const { user_id, role } = req.user;
		if (role !== "admin") {
			return res.status(403).json({
				success: false,
				message: "Access denied. Only admins can update this profile.",
			});
		}

		const full_name = req.body.full_name?.trim() || "";
		const phone = req.body.phone?.trim() || null;

		const designation = req.body.designation?.trim() || "";
		const department = req.body.department?.trim() || null;
		const employee_code = req.body.employee_id?.trim() || null;
		const alternate_email =
			req.body.alternate_email?.trim().toLowerCase() || null;
		const office_phone = req.body.office_phone?.trim() || null;
		const office_location = req.body.office_location?.trim() || null;
		const signature_image_url = req.body.signature_image_url?.trim() || "";

		if (!full_name || !designation || !signature_image_url) {
			return res.status(400).json({
				success: false,
				message:
					"Full name, designation, and signature image are required.",
			});
		}

		// =========================
		// START TRANSACTION
		// =========================
		await client.query("BEGIN");

		const userCheck = await client.query(
			`SELECT user_id, role FROM users WHERE user_id = $1 LIMIT 1`,
			[user_id],
		);

		if (userCheck.rows.length === 0) {
			await client.query("ROLLBACK");
			return res.status(404).json({
				success: false,
				message: "User not found.",
			});
		}

		if (userCheck.rows[0].role !== "admin") {
			await client.query("ROLLBACK");
			return res.status(403).json({
				success: false,
				message: "Only admin accounts can update admin profile.",
			});
		}

		await client.query(
			`
			UPDATE users
			SET full_name = $1,
			    phone = $2,
			    updated_at = CURRENT_TIMESTAMP
			WHERE user_id = $3
			`,
			[full_name, phone, user_id],
		);

		// await client.query(
		// 	`
		// 	INSERT INTO admin_profiles (admin_id)
		// 	VALUES ($1)
		// 	ON CONFLICT (admin_id) DO NOTHING
		// 	`,
		// 	[user_id],
		// );

		await client.query(
			`
			UPDATE admin_profiles
			SET designation = $1,
			    department = $2,
			    employee_code = $3,
			    alternate_email = $4,
			    office_phone = $5,
			    office_location = $6,
			    signature_image_url = $7,
			    updated_at = CURRENT_TIMESTAMP
			WHERE admin_id = $8
			`,
			[
				designation,
				department,
				employee_code,
				alternate_email,
				office_phone,
				office_location,
				signature_image_url,
				user_id,
			],
		);

		// =========================
		// COMMIT
		// =========================
		await client.query("COMMIT");

		return res.status(200).json({
			success: true,
			message: "Admin profile updated successfully",
		});
	} catch (err) {
		await client.query("ROLLBACK");

		console.error("Update admin profile error:", err);

		return res.status(500).json({
			success: false,
			message: "Failed to update admin profile",
		});
	} finally {
		client.release();
	}
};

exports.patchAdminProfile = async (req, res) => {
	try {
		const { user_id, role } = req.user;
		if (role !== "admin") {
			return res.status(403).json({
				success: false,
				message: "Access denied. Only admins can update this profile.",
			});
		}
		res.status(200).json({
			success: true,
			message: "Admin profile patched successfully",
		});
	} catch (err) {
		console.error("Patch admin profile error:", err);
		return res.status(500).json({
			success: false,
			message: "Failed to patch admin profile",
		});
	}
};

exports.getEventParticipants = async (req, res) => {
	const eventId = Number(req.params.eventId);
	const requesterId = req.user?.user_id;
	const requesterRole = req.user?.role;

	if (!eventId || Number.isNaN(eventId)) {
		return res.status(400).json({
			success: false,
			message: "Invalid event ID",
		});
	}

	if (!requesterId) {
		return res.status(401).json({
			success: false,
			message: "Unauthorized",
		});
	}

	try {
		/*
		 * ---------------------------------------------------------
		 * 1. Verify event exists
		 * ---------------------------------------------------------
		 */
		const eventResult = await pool.query(
			`
			SELECT
				id,
				title,
				start_at,
				end_at,
				status
			FROM events
			WHERE id = $1
				AND is_deleted = false
			LIMIT 1
			`,
			[eventId],
		);

		if (eventResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Event not found",
			});
		}

		const event = eventResult.rows[0];

		/*
		 * ---------------------------------------------------------
		 * 2. Authorization
		 *
		 * Admin → any event
		 * Coordinator → assigned event only
		 * ---------------------------------------------------------
		 */
		if (requesterRole !== "admin") {
			const coordinatorResult = await pool.query(
				`
				SELECT 1
				FROM event_coordinators
				WHERE event_id = $1
					AND user_id = $2
				LIMIT 1
				`,
				[eventId, requesterId],
			);

			if (coordinatorResult.rows.length === 0) {
				return res.status(403).json({
					success: false,
					message:
						"You are not authorized to view participants for this event.",
				});
			}
		}

		/*
		 * ---------------------------------------------------------
		 * 3. Get the event's dynamic form definition
		 * ---------------------------------------------------------
		 */
		const fieldsResult = await pool.query(
			`
			SELECT
				field_id,
				label,
				field_type,
				is_required,
				options,
				display_order
			FROM event_form_fields
			WHERE event_id = $1
			ORDER BY
				COALESCE(display_order, 2147483647),
				field_id
			`,
			[eventId],
		);

		/*
		 * ---------------------------------------------------------
		 * 4. Get registrations + users + custom responses
		 * ---------------------------------------------------------
		 *
		 * IMPORTANT:
		 * We do NOT hard-code any custom field names.
		 *
		 * Every response is connected through:
		 *
		 * registration_id → response
		 * field_id        → field definition
		 * ---------------------------------------------------------
		 */
		const participantsResult = await pool.query(
			`
			SELECT
				er.registration_id,
				er.event_id,
				er.user_id,
				er.status,
				er.submitted_at,
				er.approved_at,
				er.cancelled_at,
				er.team_id,

				u.full_name,
				u.email,
				u.phone,
				u.role,

				t.team_name,

				COALESCE(
					(
						SELECT jsonb_agg(
							jsonb_build_object(
								'fieldId', f.field_id,
								'label', f.label,
								'type', f.field_type,
								'required', f.is_required,
								'options', f.options,
								'value', r.response_value
							)
							ORDER BY
								COALESCE(f.display_order, 2147483647),
								f.field_id
						)
						FROM registration_custom_responses r
						INNER JOIN event_form_fields f
							ON f.field_id = r.field_id
						WHERE r.registration_id = er.registration_id
							AND f.event_id = er.event_id
					),
					'[]'::jsonb
				) AS responses,

				COALESCE(
					(
						SELECT jsonb_agg(
							jsonb_build_object(
								'userId', member_user.user_id,
								'name', member_user.full_name,
								'email', member_user.email,
								'phone', member_user.phone
							)
							ORDER BY member_user.full_name
						)
						FROM team_members tm
						INNER JOIN users member_user
							ON member_user.user_id = tm.user_id
						WHERE tm.team_id = er.team_id
					),
					'[]'::jsonb
				) AS team_members

			FROM event_registrations er

			INNER JOIN users u
				ON u.user_id = er.user_id

			LEFT JOIN teams t
				ON t.id = er.team_id

			WHERE er.event_id = $1

			ORDER BY er.submitted_at DESC
			`,
			[eventId],
		);

		const participants = participantsResult.rows.map((row) => ({
			registrationId: row.registration_id,
			status: row.status,
			submittedAt: row.submitted_at,
			approvedAt: row.approved_at,
			cancelledAt: row.cancelled_at,

			user: {
				userId: row.user_id,
				name: row.full_name,
				email: row.email,
				phone: row.phone,
				role: row.role,
			},

			team: row.team_id
				? {
						teamId: row.team_id,
						name: row.team_name,
						members: row.team_members || [],
					}
				: null,

			responses: row.responses || [],
		}));

		return res.status(200).json({
			success: true,

			event: {
				id: event.id,
				title: event.title,
				startAt: event.start_at,
				endAt: event.end_at,
				status: event.status,
			},

			formFields: fieldsResult.rows.map((field) => ({
				fieldId: field.field_id,
				label: field.label,
				type: field.field_type,
				required: field.is_required,
				options: field.options || [],
				displayOrder: field.display_order,
			})),

			participants,
			total: participants.length,
		});
	} catch (error) {
		console.error("Error fetching event participants:", error);

		return res.status(500).json({
			success: false,
			message: "Failed to fetch event participants",
		});
	}
};
