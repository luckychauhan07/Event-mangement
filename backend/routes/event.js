// EXTERNAL MODULES
const express = require("express");

// INTERNAL MODULES
const { addEvent } = require("../controllers/eventController");

const eventRouter = express.Router();

eventRouter.post("/add-event", addEvent);

module.exports = eventRouter;
