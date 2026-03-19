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
		organizerUnit,
		primaryCoordinator,
		coordinatorEmail,
		coordinatorPhone,
		eventMode,
		venue,
	} = req.body;

	// const userId = req.user.user_id;
	console.log(req.user, "is trying to create an event");

	// const event = await pool.query(
	// 	`
	// INSERT INTO events
	// (title, subtitle, description, category, event_type,
	//  start_at, end_at, event_mode, created_by, organizer_unit,
	//  primary_coordinator, coordinator_email, coordinator_phone, venue)

	// VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)

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
	// 		organizerUnit,
	// 		primaryCoordinator,
	// 		coordinatorEmail,
	// 		coordinatorPhone,
	// 		venue,
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
