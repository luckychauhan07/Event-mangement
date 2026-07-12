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
	getPendingEventRequests,
	approveEventRequest,
	rejectEventRequest,
	getEventRegistrations,
	getEventTeams,
	createEventResult,
	getEventResults,
} = require("../controllers/eventController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
	adminMiddleware,
	adminTeacherMiddleware,
} = require("../middlewares/adminMiddleware");

const eventRouter = express.Router();

// All routes here are protected and require admin access
eventRouter.delete("/:id", authMiddleware, adminMiddleware, deleteEvent);
eventRouter.put("/:id/cancel", authMiddleware, adminMiddleware, cancelEvent);
eventRouter.get("/teachers", authMiddleware, adminMiddleware, getAllTeachers);
eventRouter.get(
	"/admin/pending-requests",
	authMiddleware,
	adminMiddleware,
	getPendingEventRequests,
);
eventRouter.patch(
	"/:id/approve",
	authMiddleware,
	adminMiddleware,
	approveEventRequest,
);
eventRouter.patch(
	"/:id/reject",
	authMiddleware,
	adminMiddleware,
	rejectEventRequest,
);

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
