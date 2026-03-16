// EXTERNAL MODULES
const express = require("express");
const dotevn = require("dotenv").config();
const cors = require("cors");

// INTERNAL MODULES
const eventRouter = require("./routes/event");
const authRouter = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());

app.use(express.json()); // for parsing application/json

app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.json());

app.use((req, res, next) => {
	console.log(`${req.method} ${req.url}`);
	console.log("Body:", req.body);
	next();
});

app.use("/admin", adminRoutes);

app.use("/event", eventRouter);

app.use("/auth", authRouter);

app.listen(PORT, () => {
	console.log("server is running at the port ", PORT);
});
