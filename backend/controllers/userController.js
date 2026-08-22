const pool = require("../db/config");
const bcrypt = require("bcrypt");
const {
	mapDatabaseError,
	resolveTeamTables,
	pickRegistrationOptionalValues,
	buildOptionalUpdateAssignments,
} = require("../utils/dbHelpers");

/**
 * Fetches the profile for the currently authenticated user.
 * It joins the users table with user_profiles to provide a complete view.
 */
exports.getMyProfile = async (req, res) => {
	const userId = req.user?.user_id;

	if (!userId) {
		return res.status(401).json({
			success: false,
			message: "Unauthorized user",
		});
	}

	try {
		const result = await pool.query(
			`
			SELECT
				u.user_id,
				u.full_name,
				u.email,
				u.phone,
				u.role,
				u.status,
				u.created_at,
				p.roll_no,
				p.student_id,
				p.year,
				p.branch,
				p.department,
				p.bio,
				p.avatar_url
			FROM users u
			LEFT JOIN user_profiles p ON u.user_id = p.user_id
			WHERE u.user_id = $1
			`,
			[userId],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "User profile not found.",
			});
		}

		res.json({
			success: true,
			profile: result.rows[0],
		});
	} catch (error) {
		console.error("Error fetching user profile:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch user profile.",
		});
	}
};

/**
 * Updates the profile for the currently authenticated user.
 * This function handles updates to both the `users` and `user_profiles` tables.
 */
exports.updateMyProfile = async (req, res) => {
	const userId = req.user?.user_id;

	if (!userId) {
		return res.status(401).json({
			success: false,
			message: "Unauthorized user",
		});
	}

	const {
		full_name,
		phone,
		roll_no,
		student_id,
		year,
		branch,
		department,
		bio,
		avatar_url,
	} = req.body;

	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		// Update users table
		if (full_name || phone) {
			await client.query(
				`
				UPDATE users
				SET full_name = COALESCE($1, full_name),
					phone = COALESCE($2, phone),
					updated_at = CURRENT_TIMESTAMP
				WHERE user_id = $3
				`,
				[full_name, phone, userId],
			);
		}

		// Upsert into user_profiles table
		await client.query(
			`
			INSERT INTO user_profiles (user_id, roll_no, student_id, year, branch, department, bio, avatar_url)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			ON CONFLICT (user_id)
			DO UPDATE SET
				roll_no = EXCLUDED.roll_no,
				student_id = EXCLUDED.student_id,
				year = EXCLUDED.year,
				branch = EXCLUDED.branch,
				department = EXCLUDED.department,
				bio = EXCLUDED.bio,
				avatar_url = EXCLUDED.avatar_url,
				updated_at = CURRENT_TIMESTAMP
			`,
			[
				userId,
				roll_no,
				student_id,
				year,
				branch,
				department,
				bio,
				avatar_url,
			],
		);

		await client.query("COMMIT");

		res.json({
			success: true,
			message: "Profile updated successfully.",
		});
	} catch (error) {
		await client.query("ROLLBACK");
		console.error("Error updating user profile:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update profile.",
		});
	} finally {
		client.release();
	}
};

/**
 * Fetches all event registrations for the currently authenticated user.
 */
exports.getMyEventRegistrations = async (req, res) => {
	const userId = req.user?.user_id;

	if (!userId) {
		return res.status(401).json({
			success: false,
			message: "Unauthorized user",
		});
	}

	try {
		const result = await pool.query(
			`
			SELECT
				er.registration_id,
				er.status AS registration_status,
				er.submitted_at,
				e.id AS event_id,
				e.title AS event_title,
				e.start_at AS event_start_at,
				e.venue,
				e.entry_fee,
				ers.participation_type,
				e.event_mode
			FROM event_registrations er
			JOIN events e ON er.event_id = e.id
			LEFT JOIN event_registration_settings ers ON e.id = ers.event_id
			WHERE er.user_id = $1
			ORDER BY er.submitted_at DESC
			`,
			[userId],
		);

		res.json({
			success: true,
			registrations: result.rows,
		});
	} catch (error) {
		console.error("Error fetching user event registrations:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch event registrations.",
		});
	}
};

/**
 * Allows an authenticated user to change their own password.
 */
exports.changePassword = async (req, res) => {
	const userId = req.user?.user_id;
	const { oldPassword, newPassword } = req.body;

	if (!userId) {
		return res.status(401).json({ success: false, message: "Unauthorized" });
	}

	if (!oldPassword || !newPassword) {
		return res.status(400).json({
			success: false,
			message: "Old and new passwords are required.",
		});
	}

	try {
		const userResult = await pool.query(
			"SELECT password_hash FROM users WHERE user_id = $1",
			[userId],
		);

		if (userResult.rows.length === 0) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		const user = userResult.rows[0];
		const isMatch = await bcrypt.compare(oldPassword, user.password_hash);

		if (!isMatch) {
			return res.status(401).json({ success: false, message: "Incorrect old password" });
		}

		const saltRounds = Number(process.env.BCRYPT_ROUNDS ?? 10);
		const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

		await pool.query("UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2", [hashedPassword, userId]);

		res.json({ success: true, message: "Password changed successfully." });
	} catch (error) {
		console.error("Error changing password:", error);
		res.status(500).json({ success: false, message: "Failed to change password." });
	}
};

exports.registerForEvent = async (req, res) => {
	const eventId = Number(req.params.id);
	const userId = req.user?.user_id;

	// Robustly check if the event is a team event.
	// This handles cases where event_registration_settings might not exist for an event.
	const eventDetailsForReg = await pool.query(
		"SELECT participation_type FROM event_registration_settings WHERE event_id = $1",
		[eventId],
	).catch(() => ({ rows: [] })); // Default to empty rows on error or no-find.

	const isTeamEvent = eventDetailsForReg.rows[0]?.participation_type === 'team';
	const teamRegistration = isTeamEvent ? (req.body?.teamRegistration || null) : null;

	if (!eventId || Number.isNaN(eventId)) {
		return res.status(400).json({
			success: false,
			message: "Invalid event ID",
		});
	}

	if (!userId) {
		return res.status(401).json({
			success: false,
			message: "Unauthorized user",
		});
	}

	try {
		const eventResult = await pool.query(
			`
			SELECT
				e.id,
				e.status,
				e.start_at,
				COALESCE(r.allow_registration, false) AS allow_registration,
				r.registration_type,
				r.registration_start,
				r.registration_end,
				COALESCE(r.participation_type, 'individual') AS participation_type,
				COALESCE(r.min_team_size, 1) AS min_team_size,
				COALESCE(r.max_team_size, 1) AS max_team_size
			FROM events e
			LEFT JOIN event_registration_settings r
				ON r.event_id = e.id
			WHERE e.id = $1
				AND e.is_deleted = false
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
		const now = new Date();
		const startDate = new Date(event.start_at);
		const registrationStart = event.registration_start
			? new Date(event.registration_start)
			: null;
		const registrationEnd = event.registration_end
			? new Date(event.registration_end)
			: null;
		const initialRegistrationStatus =
			event.registration_type === "approval-based"
				? "pending"
				: "approved";
		const normalizedParticipationType =
			event.participation_type || "individual";

		if (event.status === "cancelled") {
			return res.status(400).json({
				success: false,
				message: "Cancelled events cannot be registered",
			});
		}

		if (Number.isNaN(startDate.getTime())) {
			return res.status(400).json({
				success: false,
				message: "Invalid event start date",
			});
		}
		// Note: allow registration for events that are already started (ongoing)
		// as long as registration settings (allow_registration, registration_start/registration_end)
		// permit it. Previous code rejected registrations when start_at <= now; that
		// prevented registering for ongoing events.

		if (event.status === "ongoing") {
			return res.status(400).json({
				success: false,
				message: "Registration is closed because the event is ongoing.",
			});
		}

		if (!event.allow_registration) {
			return res.status(400).json({
				success: false,
				message: "Registration is not enabled for this event",
			});
		}

		if (registrationStart && registrationStart > now) {
			return res.status(400).json({
				success: false,
				message: "Registration has not started yet",
			});
		}

		if (registrationEnd && registrationEnd < now) {
			return res.status(400).json({
				success: false,
				message: "Registration has already closed",
			});
		}

		if (normalizedParticipationType === "team") {
			const client = await pool.connect();
			const teamName = teamRegistration?.teamName?.trim();
			const selectedMembers = Array.isArray(teamRegistration?.members)
				? teamRegistration.members.filter(
						(member) =>
							member?.user_id || member?.email?.trim(),
				  )
				: [];
			const totalTeamCount = 1 + selectedMembers.length;
			const minTeamSize = Number(event.min_team_size) || 1;
			// Ensure maxTeamSize is at least minTeamSize if minTeamSize is provided.
			// This prevents maxTeamSize from being 1 (default) when minTeamSize is > 1.
			const defaultMaxTeamSize =
				minTeamSize > 1 ? minTeamSize : 1;
			const maxTeamSize = Number(event.max_team_size) || minTeamSize;

			if (!teamName) {
				client.release();
				return res.status(400).json({
					success: false,
					message: "Team name is required for team registration",
				});
			}

			if (totalTeamCount < minTeamSize) {
				client.release();
				return res.status(400).json({
					success: false,
					message: `A minimum of ${minTeamSize} team members is required`,
				});
			}

			if (totalTeamCount > maxTeamSize) {
				client.release();
				return res.status(400).json({
					success: false,
					message: `A maximum of ${maxTeamSize} team members is allowed`,
				});
			}

			const memberUserIds = selectedMembers
				.map((member) => Number(member.user_id))
				.filter((value) => Number.isFinite(value));
			const memberEmails = selectedMembers
				.map((member) => String(member.email || "").trim().toLowerCase())
				.filter(Boolean);

			// Check for duplicate emails within the submission payload
			if (new Set(memberEmails).size !== memberEmails.length) {
				client.release();
				return res.status(400).json({
					success: false,
					message: "Duplicate emails found in team members list.",
				});
			}

			const resolvedUsersResult = await client.query(
				`
				SELECT user_id, email, status
				FROM users
				WHERE
					(
						(user_id = ANY($1::int[]))
						OR (LOWER(email) = ANY($2::text[]))
					)
				`,
				[memberUserIds.length ? memberUserIds : [-1], memberEmails],
			);
			
			const resolvedUsersMap = new Map();
			resolvedUsersResult.rows.forEach(user => {
				resolvedUsersMap.set(user.email.toLowerCase(), user);
			});

			const invalidMembers = [];
			for (const email of memberEmails) {
				const user = resolvedUsersMap.get(email);
				if (!user) {
					invalidMembers.push({ email, reason: "This user is not registered." });
				} else if (user.status !== 'active') {
					invalidMembers.push({ email, reason: `This user is not currently active (status: ${user.status}).` });
				}
			}

			if (invalidMembers.length > 0) {
				client.release();
				return res.status(400).json({
					success: false,
					message: "One or more team members are invalid.",
					errors: { members: invalidMembers }
				});
			}

			const resolvedUserIds = resolvedUsersResult.rows.map((row) => Number(row.user_id));
			const uniqueMemberUserIds = [
				...new Set([userId, ...resolvedUserIds]),
			];

			if (uniqueMemberUserIds.length !== 1 + selectedMembers.length) {
				client.release();
				return res.status(400).json({
					success: false,
					message:
						"One or more selected team members are invalid, duplicated, or could not be found.",
				});
			}

			const existingMemberRegistrations = await client.query(
				`
				SELECT user_id
				FROM event_registrations
				WHERE event_id = $1
					AND user_id = ANY($2::int[])
					AND status != 'cancelled'
				`,
				[eventId, uniqueMemberUserIds],
			);

			if (existingMemberRegistrations.rows.length > 0) {
				client.release();
				const registeredUserId = existingMemberRegistrations.rows[0].user_id;
				const registeredUser = resolvedUsersResult.rows.find(u => u.user_id === registeredUserId);

				return res.status(409).json({
					success: false,
					message: `Team member ${
						registeredUser
							? `(${registeredUser.email})`
							: ""
					} is already registered for this event.`,
				});
			}

			try {
				await client.query("BEGIN");

				const { teamsTable, teamMembersTable } =
					await resolveTeamTables(client);

				if (!teamsTable || !teamMembersTable) {
					await client.query("ROLLBACK");
					return res.status(500).json({
						success: false,
						message:
							"Team tables are not configured in the database (teams/team_members).",
					});
				}

				const existingTeamName = await client.query(
					`
					SELECT id
					FROM ${teamsTable}
					WHERE event_id = $1
						AND LOWER(team_name) = LOWER($2)
					LIMIT 1
					`,
					[eventId, teamName],
				);

				if (existingTeamName.rows.length > 0) {
					await client.query("ROLLBACK");
					return res.status(409).json({
						success: false,
						message:
							"Team name already exists for this event. Please choose a different team name.",
					});
				}

				const teamResult = await client.query(
					`
					INSERT INTO ${teamsTable} (event_id, team_name)
					VALUES ($1, $2)
					RETURNING id
					`,
					[eventId, teamName],
				);

				const teamId = teamResult.rows[0].id;
				const memberPlaceholders = uniqueMemberUserIds
					.map(
						(_, index) =>
							`($1, $${index + 2})`,
					)
					.join(", ");

				await client.query(
					`
					INSERT INTO ${teamMembersTable} (team_id, user_id)
					VALUES ${memberPlaceholders}
					`,
					[teamId, ...uniqueMemberUserIds],
				);

				const registrationUpsert = await client.query(
					`
					INSERT INTO event_registrations (
						event_id,
						user_id,
						team_id,
						status,
						submitted_at,
						approved_at
					)
					VALUES (
						$1,
						$2,
						$3,
						$4::varchar,
						CURRENT_TIMESTAMP,
						CASE
							WHEN $4::text = 'approved' THEN CURRENT_TIMESTAMP
							ELSE NULL
						END
					)
					ON CONFLICT (event_id, user_id)
					DO UPDATE SET
						team_id = EXCLUDED.team_id,
						status = EXCLUDED.status,
						submitted_at = EXCLUDED.submitted_at,
						approved_at = EXCLUDED.approved_at,
						cancelled_at = NULL
					WHERE event_registrations.status = 'cancelled'
					RETURNING registration_id, status
					`,
					[eventId, userId, teamId, initialRegistrationStatus],
				);

				if (registrationUpsert.rows.length === 0) {
					await client.query("ROLLBACK");
					return res.status(409).json({
						success: false,
						message: "You are already registered for this event",
					});
				}

				await client.query("COMMIT");

				return res.status(201).json({
					success: true,
					message:
						initialRegistrationStatus === "pending"
							? "Team registration submitted and waiting for approval"
							: "Team registered successfully",
					registrationStatus: initialRegistrationStatus,
				});
			} catch (teamError) {
				await client.query("ROLLBACK");

				const mappedDatabaseError = mapDatabaseError(teamError);
				if (mappedDatabaseError) {
					return res.status(mappedDatabaseError.status).json({
						success: false,
						message: mappedDatabaseError.message,
						errors: mappedDatabaseError.errors,
					});
				}

				if (teamError?.code === "23505") {
					return res.status(409).json({
						success: false,
						message:
							"Duplicate detected. Try a different team name or check if you already registered.",
					});
				}

				throw teamError;
			} finally {
				client.release();
			}
		}

		const existingRegistration = await pool.query(
			`
			SELECT registration_id, status
			FROM event_registrations
			WHERE event_id = $1 AND user_id = $2
			LIMIT 1
			`,
			[eventId, userId],
		);

		if (existingRegistration.rows.length > 0) {
			const existing = existingRegistration.rows[0];

			if (existing.status !== "cancelled") {
				return res.status(409).json({
					success: false,
					message: "You are already registered for this event",
				});
			}

			const { assignments, values } =
				await buildOptionalUpdateAssignments(
					pool,
					teamRegistration,
					2,
				);

			await pool.query(
				`
				UPDATE event_registrations
				SET status = $2::varchar,
					submitted_at = CURRENT_TIMESTAMP,
					approved_at = CASE
						WHEN $2::text = 'approved' THEN CURRENT_TIMESTAMP
						ELSE NULL
					END,
					cancelled_at = NULL
					${
						assignments.length > 0
							? `, ${assignments.join(", ")}`
							: ""
					}
				WHERE registration_id = $1
				`,
				[existing.registration_id, initialRegistrationStatus, ...values],
			);

			return res.status(200).json({
				success: true,
				message:
					initialRegistrationStatus === "pending"
						? "Registration submitted and waiting for approval"
						: "Registration successful",
				registrationStatus: initialRegistrationStatus,
			});
		}

		const { optionalColumns, optionalValues } =
			await pickRegistrationOptionalValues(pool, teamRegistration);
		const baseValues = [eventId, userId, initialRegistrationStatus];
		const optionalColumnList =
			optionalColumns.length > 0 ? `, ${optionalColumns.join(", ")}` : "";
		const optionalPlaceholderList =
			optionalValues.length > 0
				? `, ${optionalValues
						.map((_, index) => `$${index + 4}`)
						.join(", ")}`
				: "";

		await pool.query(
			`
			INSERT INTO event_registrations (
				event_id,
				user_id,
				status,
				approved_at
				${optionalColumnList}
			)
			VALUES (
				$1,
				$2,
				$3::varchar,
				CASE
					WHEN $3::text = 'approved' THEN CURRENT_TIMESTAMP
					ELSE NULL
				END
				${optionalPlaceholderList}
			)
			`,
			[...baseValues, ...optionalValues],
		);

		return res.status(201).json({
			success: true,
			message:
				initialRegistrationStatus === "pending"
					? "Registration submitted and waiting for approval"
					: "Registration successful",
			registrationStatus: initialRegistrationStatus,
		});
	} catch (error) {
		console.error("Error registering for event:", error);

		const mappedDatabaseError = mapDatabaseError(error);
		if (mappedDatabaseError) {
			return res.status(mappedDatabaseError.status).json({
				success: false,
				message: mappedDatabaseError.message,
				errors: mappedDatabaseError.errors,
			});
		}

		return res.status(500).json({
			success: false,
			message: "Failed to register for event",
		});
	}
};

exports.withdrawFromEvent = async (req, res) => {
	const eventId = Number(req.params.id);
	const userId = req.user?.user_id;

	if (!eventId || Number.isNaN(eventId)) {
		return res.status(400).json({
			success: false,
			message: "Invalid event ID",
		});
	}

	if (!userId) {
		return res.status(401).json({
			success: false,
			message: "Unauthorized user",
		});
	}

	try {
		// Get event and registration settings
		const eventResult = await pool.query(
			`
			SELECT
				e.id,
				e.status,
				e.start_at,
				r.participation_type
			FROM events e
			LEFT JOIN event_registration_settings r ON r.event_id = e.id
			WHERE e.id = $1 AND e.is_deleted = false
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

		// Check if withdrawal is allowed (before event starts)
		const now = new Date();
		const eventStart = new Date(event.start_at);

		if (eventStart <= now) {
			return res.status(400).json({
				success: false,
				message: "You cannot withdraw after the event has started.",
			});
		}

		// Check if user is registered
		const registrationResult = await pool.query(
			`
			SELECT registration_id, status, team_id
			FROM event_registrations
			WHERE event_id = $1 AND user_id = $2
			LIMIT 1
			`,
			[eventId, userId],
		);

		if (registrationResult.rows.length === 0) {
			return res.status(400).json({
				success: false,
				message: "You are not registered for this event",
			});
		}

		const registration = registrationResult.rows[0];

		if (registration.status === "cancelled") {
			return res.status(400).json({
				success: false,
				message: "You have already withdrawn from this event",
			});
		}

		// For team events, remove user from team but keep registration record
		if (event.participation_type === "team" && registration.team_id) {
			const client = await pool.connect();
			try {
				await client.query("BEGIN");

				const { teamsTable, teamMembersTable } =
					await resolveTeamTables(client);

				if (!teamsTable || !teamMembersTable) {
					await client.query("ROLLBACK");
					return res.status(500).json({
						success: false,
						message:
							"Team tables are not configured in the database (teams/team_members).",
					});
				}

				// Remove user from team members
				await client.query(
					`
					DELETE FROM ${teamMembersTable}
					WHERE team_id = $1 AND user_id = $2
					`,
					[registration.team_id, userId],
				);

				// Check if any members left in team
				const teamMembersResult = await client.query(
					`
					SELECT COUNT(*) as member_count
					FROM ${teamMembersTable}
					WHERE team_id = $1
					`,
					[registration.team_id],
				);

				const memberCount = parseInt(
					teamMembersResult.rows[0].member_count,
				);

				// If no members left, delete the team
				if (memberCount === 0) {
					await client.query(
						`DELETE FROM ${teamsTable} WHERE id = $1`,
						[registration.team_id],
					);
				}

				// Update registration status to cancelled
				await client.query(
					`
					UPDATE event_registrations
					SET status = $2, cancelled_at = CURRENT_TIMESTAMP
					WHERE registration_id = $1
					`,
					[registration.registration_id, "cancelled"],
				);

				await client.query("COMMIT");

				return res.status(200).json({
					success: true,
					message:
						memberCount === 0
							? "You have been removed from the team and withdrawn from the event"
							: "You have been removed from the team",
				});
			} catch (teamError) {
				await client.query("ROLLBACK");
				throw teamError;
			} finally {
				client.release();
			}
		}

		// For individual registrations, just mark as cancelled
		await pool.query(
			`
			UPDATE event_registrations
			SET status = $2, cancelled_at = CURRENT_TIMESTAMP
			WHERE registration_id = $1
			`,
			[registration.registration_id, "cancelled"],
		);

		return res.status(200).json({
			success: true,
			message: "You have successfully withdrawn from the event",
		});
	} catch (error) {
		console.error("Error withdrawing from event:", error);

		return res.status(500).json({
			success: false,
			message: "Failed to withdraw from event",
		});
	}
};