export const addEvent = async (req, res) => {
	const {
		title,
		subtitle,
		description,
		category,
		eventType,
		startAt,
		endAt,
		mode,
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
	// 		mode,
	// 		userId,
	// 	],
	// );
	console.log("Event data received:", req.body);
	res.json({
		message: "Event created",
		// event: event.rows[0],
	});
};
