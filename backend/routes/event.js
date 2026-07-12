// EXTERNAL MODULES
const express = require("express");

// INTERNAL MODULES
const {
	addEvent,
	getAllTeachers,
	getEventDetails,
	getAllDetailsForEvent,
	getAllEvents,
	getTeacherEvents,
	getTeacherDashboard,
	deleteEvent,
	cancelEvent,
	getEventRegistrations,
	getEventTeams,
	createEventResult,
	getEventResults,
} = require("../controllers/eventController");
const authMiddleware = require("../middlewares/authMiddleware");
<<<<<<< HEAD
const adminMiddleware = require("../middlewares/adminMiddleware");
=======
const {
	adminMiddleware,
	adminTeacherMiddleware,
} = require("../middlewares/adminMiddleware");
>>>>>>> taniya-teacher-coordinator

const eventRouter = express.Router();

// All routes here are protected and require admin access
eventRouter.delete("/:id", authMiddleware, adminMiddleware, deleteEvent);
eventRouter.put("/:id/cancel", authMiddleware, adminMiddleware, cancelEvent);
eventRouter.get("/teachers", authMiddleware, adminMiddleware, getAllTeachers);

// All routes here are protected and require either admin or teacher access
eventRouter.post("/", authMiddleware, adminTeacherMiddleware, addEvent);

// no admin middleware here since teachers and coordinators should be able to view event details
eventRouter.get("/teacher/events", authMiddleware, getTeacherEvents);
eventRouter.get("/teacher/dashboard", authMiddleware, getTeacherDashboard);

// Registration list
eventRouter.get("/:id/registrations", authMiddleware, getEventRegistrations);

// Team list
eventRouter.get("/:id/teams", authMiddleware, getEventTeams);

eventRouter.get("/", authMiddleware, getAllEvents);

eventRouter.get("/:id", authMiddleware, getEventDetails);
eventRouter.get("/:id/details", authMiddleware, getAllDetailsForEvent);

module.exports = eventRouter;
