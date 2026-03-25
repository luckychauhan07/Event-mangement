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

exports.approveTeacher = async (req, res) => {
	try {
		const { id, action } = req.params;
		const { rejectReason } = req.body;
		// incoming parameters
		if (action === "reject") {
			const result = await pool.query(
				`UPDATE users
				SET status='rejected'
				WHERE user_id=$1`,
				[id],
			);
			// Optionally, you can log the rejection reason in a separate table for audit purposes
			await pool.query(
				`INSERT INTO teacher_rejections (user_id, reason)
					VALUES ($1, $2)`,
				[id, rejectReason],
			);
		} else if (action === "approve") {
			await pool.query(
				`UPDATE users
				SET status='active'
				WHERE user_id=$1`,
				[id],
			);
		} else {
			return res.status(400).json({
				success: false,
				message: "Invalid action",
			});
		}
		res.json({
			success: true,
			message: "Teacher updated successfully",
		});
	} catch (err) {
		// Log the error for debugging
		console.error("Error in approveTeacher:", err);
		res.status(500).json({
			success: false,
			message: "Approval failed",
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
