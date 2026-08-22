const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
	getAllEvents,
	getEventDetails,
} = require("../controllers/userEventController");

router.use(authMiddleware);

router.get("/", getAllEvents);
router.get("/:id", getEventDetails);

module.exports = router;