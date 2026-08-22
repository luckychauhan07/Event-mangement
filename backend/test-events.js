const pool = require("./db/config");

async function testEvents() {
	try {
		console.log("Testing database connection...");

		// Get all events
		const eventsResult = await pool.query(
			"SELECT id, title, created_at FROM events LIMIT 5"
		);
		console.log("\n✅ Events in database:", eventsResult.rows);

		// Check event_registration_settings
		const regSettingsResult = await pool.query(
			"SELECT event_id, participation_type, min_team_size, max_team_size FROM event_registration_settings LIMIT 5"
		);
		console.log("\n✅ Registration settings:", regSettingsResult.rows);

		// Get a full event with registration settings
		if (eventsResult.rows.length > 0) {
			const eventId = eventsResult.rows[0].id;
			const fullEventResult = await pool.query(
				`SELECT e.*, r.participation_type, r.min_team_size, r.max_team_size
				 FROM events e
				 LEFT JOIN event_registration_settings r ON r.event_id = e.id
				 WHERE e.id = $1`,
				[eventId]
			);
			console.log("\n✅ Full event with settings:", fullEventResult.rows[0]);
		}

		process.exit(0);
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
}

testEvents();
