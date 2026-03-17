// EXTERNAL MODULES
const express = require("express");

// INTERNAL MODULES
const { addEvent, getAllTeachers } = require("../controllers/eventController");

const eventRouter = express.Router();

eventRouter.post("/add-event", addEvent);
eventRouter.get("/teachers", getAllTeachers);

module.exports = eventRouter;
