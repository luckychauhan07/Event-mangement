const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
	getMyProfile,
	updateMyProfile,
	getMyEventRegistrations,
	changePassword,
	registerForEvent,
	withdrawFromEvent,
} = require("../controllers/userController");

// All routes in this file are for the authenticated user and should be protected.
router.use(authMiddleware);

// GET /api/user/profile - Fetches the current user's profile
router.get("/profile", getMyProfile);

// PUT /api/user/profile - Updates the current user's profile
router.put("/profile", updateMyProfile);

// GET /api/user/registrations - Fetches events the user is registered for
router.get("/registrations", getMyEventRegistrations);

// POST /api/user/change-password - Allows user to change their password
router.post("/change-password", changePassword);

// POST /api/user/events/:id/register - Register for an event
router.post("/events/:id/register", registerForEvent);

// POST /api/user/events/:id/withdraw - Withdraw from an event
router.post("/events/:id/withdraw", withdrawFromEvent);

module.exports = router;