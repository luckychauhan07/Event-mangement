const pool = require("../db/config");

const isAllowedSenderRole = (role) => role === "admin" || role === "teacher";

exports.createNotification = async (req, res) => {
	const sender = req.user;
	if (!sender?.user_id) {
		return res.status(401).json({
			success: false,
			message: "Unauthorized user",
		});
	}

	if (!isAllowedSenderRole(sender.role)) {
		return res.status(403).json({
			success: false,
			message: "Only admin or teacher can send notifications",
		});
	}

	const title = String(req.body?.title || "").trim();
	const message = String(req.body?.message || "").trim();
	const targetRole = String(req.body?.targetRole || "student").trim();
	const priority = String(req.body?.priority || "normal").trim();
	const linkUrl = req.body?.linkUrl ? String(req.body.linkUrl).trim() : null;

	if (!title || !message) {
		return res.status(400).json({
			success: false,
			message: "Title and message are required",
		});
	}

	try {
		const result = await pool.query(
			`
			INSERT INTO notifications (
				title,
				message,
				target_role,
				priority,
				link_url,
				sender_id,
				sender_role
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING id, created_at
			`,
			[
				title,
				message,
				targetRole,
				priority,
				linkUrl,
				sender.user_id,
				sender.role,
			],
		);

		return res.status(201).json({
			success: true,
			message: "Notification created",
			notification: result.rows[0],
		});
	} catch (error) {
		console.error("Error creating notification:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to create notification",
		});
	}
};

exports.getMyNotifications = async (req, res) => {
	const user = req.user;
	if (!user?.user_id) {
		return res.status(401).json({
			success: false,
			message: "Unauthorized user",
		});
	}

	const limit = Math.min(Number(req.query?.limit) || 50, 100);
	const offset = Math.max(Number(req.query?.offset) || 0, 0);

	try {
		const result = await pool.query(
			`
			SELECT
				n.id,
				n.title,
				n.message,
				n.target_role,
				n.priority,
				n.link_url,
				n.sender_id,
				n.sender_role,
				n.created_at,
				(nr.read_at IS NOT NULL) AS is_read,
				nr.read_at
			FROM notifications n
			LEFT JOIN notification_reads nr
				ON nr.notification_id = n.id
				AND nr.user_id = $1
			WHERE n.target_role = $2
				OR n.target_role = 'all'
			ORDER BY n.created_at DESC
			LIMIT $3 OFFSET $4
			`,
			[user.user_id, user.role, limit, offset],
		);

		return res.status(200).json({
			success: true,
			notifications: result.rows,
		});
	} catch (error) {
		console.error("Error fetching notifications:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch notifications",
		});
	}
};

exports.markNotificationRead = async (req, res) => {
	const user = req.user;
	const notificationId = Number(req.params.id);

	if (!user?.user_id) {
		return res.status(401).json({
			success: false,
			message: "Unauthorized user",
		});
	}

	if (!notificationId || Number.isNaN(notificationId)) {
		return res.status(400).json({
			success: false,
			message: "Invalid notification id",
		});
	}

	try {
		await pool.query(
			`
			INSERT INTO notification_reads (notification_id, user_id)
			VALUES ($1, $2)
			ON CONFLICT (notification_id, user_id)
			DO UPDATE SET read_at = CURRENT_TIMESTAMP
			`,
			[notificationId, user.user_id],
		);

		return res.status(200).json({
			success: true,
			message: "Marked as read",
		});
	} catch (error) {
		console.error("Error marking notification read:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to mark notification read",
		});
	}
};
exports.markAllNotificationsRead = async (req, res) => {
	const user = req.user;

	if (!user?.user_id) {
		return res.status(401).json({
			success: false,
			message: "Unauthorized user",
		});
	}

	try {
		await pool.query(
			`
			INSERT INTO notification_reads (notification_id, user_id)
			SELECT n.id, $1
			FROM notifications n
			WHERE n.target_role = $2
				OR n.target_role = 'all'
			ON CONFLICT (notification_id, user_id)
			DO UPDATE SET read_at = CURRENT_TIMESTAMP
			`,
			[user.user_id, user.role],
		);

		return res.status(200).json({
			success: true,
			message: "All notifications marked as read",
		});
	} catch (error) {
		console.error("Error marking all notifications as read:", error);

		return res.status(500).json({
			success: false,
			message: "Failed to mark all notifications as read",
		});
	}
};
