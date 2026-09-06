// Load environment variables FIRST
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") }); // Load root .env when running from backend folder

// EXTERNAL MODULES
const express = require("express");
const cors = require("cors");

// INTERNAL MODULES
const eventRouter = require("./routes/event");
const authRouter = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes"); // Import user routes
const userEventRoutes = require("./routes/userEventRoutes"); // Import user event routes
const notificationRouter = require("./routes/notificationRoutes"); // Added for notifications

const PORT = process.env.PORT || 3000;

const app = express();
const allowedOrigins = [
	"http://localhost:5173",
	process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests without an Origin header
			// (useful for Postman/server-to-server requests)
			if (!origin) {
				return callback(null, true);
			}

			if (allowedOrigins.includes(origin)) {
				return callback(null, true);
			}

			return callback(new Error("Not allowed by CORS"));
		},
		credentials: true,
	}),
);

app.use(express.json()); // for parsing application/json

app.use(express.urlencoded({ extended: true })); // for parsing application/x-w-form-urlencoded

app.use((req, res, next) => {
	console.log(`${req.method} ${req.url}`);
	// Avoid logging sensitive body content in production
	if (process.env.NODE_ENV !== "production") {
		console.log("Body:", req.body);
	}
	next();
});

// --- API ROUTES ---
app.use("/admin", adminRoutes);
app.use("/event", eventRouter);
app.use("/auth", authRouter);
app.use("/api/user/events", userEventRoutes); // Mount user event routes (MUST be before /api/user)
app.use("/api/user", userRoutes); // Mount user profile/registration routes
app.use("/notifications", notificationRouter);

app.listen(PORT, () => {
	console.log("server is running at the port ", PORT);
});
