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

app.use(cors());

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

// --- SERVE FRONTEND IN PRODUCTION ---
// This block should come AFTER your API routes.
if (process.env.NODE_ENV === "production") {
	// 1. Define the path to the built frontend assets
	const buildPath = path.join(__dirname, "..", "frontend", "dist");

	// 2. Serve the static files (JS, CSS, images, etc.)
	app.use(express.static(buildPath));

	// 3. For any other request, serve the frontend's index.html
	// This is crucial for client-side routing (React Router) to work.
	app.get("*", (req, res) => {
		res.sendFile(path.join(buildPath, "index.html"));
	});
}

app.listen(PORT, () => {
	console.log("server is running at the port ", PORT);
});
