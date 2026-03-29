// EXTERNAL MODULES
const express = require("express");

// INTERNAL MODULES
const {
	addEvent,
	getAllTeachers,
	getEventDetails,
	getAllEvents,
	deleteEvent,
	cancelEvent,
} = require("../controllers/eventController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const pool = require("../db/config");
const { del } = require("framer-motion/client");

const eventRouter = express.Router();

// All routes here are protected and require admin access
eventRouter.post("/", authMiddleware, adminMiddleware, addEvent);
eventRouter.get("/teachers", authMiddleware, adminMiddleware, getAllTeachers);
eventRouter.delete("/:id", authMiddleware, adminMiddleware, deleteEvent);
eventRouter.put("/:id/cancel", authMiddleware, adminMiddleware, cancelEvent);

// no admin middleware here since teachers and coordinators should be able to view event details
eventRouter.get("/", authMiddleware, getAllEvents);
eventRouter.get("/:id", authMiddleware, getEventDetails);

module.exports = eventRouter;
