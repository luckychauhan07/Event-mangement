const pool = require("../db/config");

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
	console.log("Fetching all users...", req.user, req.url); // Debug log to check if user info is available
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
	console.log(`Fetching details for user ID: ${id}`); // Debug log to check incoming ID
	try {
		const result = await pool.query(
			`SELECT user_id, full_name, email, phone, role, status
			FROM users
			WHERE user_id = $1`,
			[id],
		);
		console.log("Fetched user details for ID:", id, result.rows); // Debug log to check fetched data
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
