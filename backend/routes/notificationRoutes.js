const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware"); // Assuming you have auth middleware
const {
	createNotification,
	getMyNotifications,
	markNotificationRead,
	markAllNotificationsRead,
} = require("../controllers/notificationController");

// All notification routes should be protected
router.use(authMiddleware);

// POST /notifications - Create a new notification (for admin/teacher)
router.post("/", createNotification);

// GET /notifications or /notifications/mine - Get notifications for the logged-in user
router.get(["/", "/mine"], getMyNotifications);

// POST /notifications/:id/read - Mark a notification as read
router.post("/:id/read", markNotificationRead);

// POST /notifications/mark-all-read - Mark all notifications as read
router.post("/mark-all-read", markAllNotificationsRead);

module.exports = router;
