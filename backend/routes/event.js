// EXTERNAL MODULES
const express = require("express");

// INTERNAL MODULES
const {
	addEvent,
	getAllTeachers,
	deleteEvent,
	cancelEvent,
} = require("../controllers/eventController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");


const eventRouter = express.Router();

// All routes here are protected and require admin access
eventRouter.post("/", authMiddleware, adminMiddleware, addEvent);
eventRouter.get("/teachers", authMiddleware, adminMiddleware, getAllTeachers);
eventRouter.delete("/:id", authMiddleware, adminMiddleware, deleteEvent);
eventRouter.put("/:id/cancel", authMiddleware, adminMiddleware, cancelEvent);

module.exports = eventRouter;
