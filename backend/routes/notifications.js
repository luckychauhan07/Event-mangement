const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
	createNotification,
	getMyNotifications,
	markNotificationRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.use(authMiddleware);

router.get("/mine", getMyNotifications);
router.post("/", createNotification);
router.post("/:id/read", markNotificationRead);

module.exports = router;
