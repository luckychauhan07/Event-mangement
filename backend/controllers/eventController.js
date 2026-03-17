const pool = require("../db/config");

exports.addEvent = async (req, res) => {
	const {
		title,
		subtitle,
		description,
		category,
		eventType,
		startAt,
		endAt,
		eventMode,
	} = req.body;

	// const userId = req.user.user_id;
	console.log(req.user, "is trying to create an event");

	// const event = await pool.query(
	// 	`
	// INSERT INTO events
	// (title, subtitle, description, category, event_type,
	//  start_at, end_at, event_mode, created_by)

	// VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)

	// RETURNING *
	// `,
	// 	[
	// 		title,
	// 		subtitle,
	// 		description,
	// 		category,
	// 		eventType,
	// 		startAt,
	// 		endAt,
	// 		eventMode,
	// 		userId,
	// 	],
	// );
	console.log("Event data received:", req.body);
	res.json({
		message: "Event created",
		// event: event.rows[0],
	});
};

exports.getAllTeachers = async (req, res) => {
	try {
		const teachers = await pool.query(
			`SELECT full_name AS name, email, phone
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
