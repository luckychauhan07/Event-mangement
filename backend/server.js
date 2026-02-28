// EXTERNAL MODULES
const express = require("express");
const dotevn = require("dotenv").config();
const cors = require("cors");

// INTERNAL MODULES
const eventRouter = require("./routes/event");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(express.json());

app.use(eventRouter);

app.listen(PORT, () => {
	console.log("server is running at the port ", PORT);
});
