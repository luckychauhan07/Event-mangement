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
		const { id } = req.params;

		await pool.query(
			`UPDATE users
       SET status='active'
       WHERE user_id=$1`,
			[id],
		);

		res.json({
			success: true,
			message: "Teacher approved successfully",
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Approval failed",
		});
	}
};
