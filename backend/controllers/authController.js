const pool = require("../db/config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getDatabaseErrorMessage = (error) => {
	if (!error?.code) {
		return null;
	}

	switch (error.code) {
		case "ENOTFOUND":
			return "Database host could not be resolved. Check your DATABASE_URL in .env. If you are using Supabase, your project may be paused due to inactivity.";
		case "ECONNREFUSED":
			return "Database connection was refused. Verify the database host, port, and network access.";
		case "28P01":
			return "Database authentication failed. Check the username or password in DATABASE_URL.";
		case "3D000":
			return "Database does not exist. Check the database name in DATABASE_URL.";
		default:
			return null;
	}
};

exports.register = async (req, res) => {
	try {
		const full_name = req.body.full_name?.trim();
		const email = req.body.email?.trim().toLowerCase();
		const phone = req.body.phone?.trim() || null;
		const password = req.body.password;
		const role = req.body.role;

		if (
			typeof full_name !== "string" ||
			typeof email !== "string" ||
			typeof password !== "string" ||
			!full_name ||
			!email ||
			!password
		) {
			return res.status(400).json({
				success: false,
				message: "Required fields missing or invalid",
			});
		}

		// check if user exists
		const existing = await pool.query(
			"SELECT * FROM users WHERE email=$1",
			[email],
		);

		if (existing.rows.length > 0) {
			return res.status(400).json({
				success: false,
				message: "Email already registered",
			});
		}

		// hash password
		const saltRounds = Number(process.env.BCRYPT_ROUNDS ?? 10);
		if (
			!Number.isInteger(saltRounds) ||
			saltRounds < 4 ||
			saltRounds > 31
		) {
			return res.status(500).json({
				success: false,
				message: "Invalid bcrypt rounds config",
			});
		}

		const hashedPassword = await bcrypt.hash(password, saltRounds);
		const status = role === "teacher" ? "pending" : "active";
		const result = await pool.query(
			`INSERT INTO users (full_name,email,password_hash,phone,role,status)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING user_id,full_name,email,role`,
			[
				full_name,
				email,
				hashedPassword,
				phone,
				role || "student",
				status,
			],
		);

		res.json({
			success: true,
			data: result.rows[0],
			message: "User registered",
		});
	} catch (err) {
		console.error("REGISTER ERROR:", err);
		const dbMessage = getDatabaseErrorMessage(err);
		if (dbMessage) {
			return res.status(503).json({ success: false, message: dbMessage });
		}
		return res.status(500).json({
			success: false,
			message: "Registration failed due to a server error.",
			error: process.env.NODE_ENV !== "production" ? err.message : undefined,
		});
	}
};

exports.login = async (req, res) => {
	console.log("LOGIN HANDLER START", { path: req.path, body: req.body, envDatabaseUrl: !!process.env.DATABASE_URL });
	try {
		const email = req.body.email?.trim().toLowerCase();
		const password = req.body.password;
		if (
			typeof email !== "string" ||
			typeof password !== "string" ||
			!email ||
			!password
		) {
			return res.status(400).json({
				success: false,
				message: "Email and password must be non-empty strings",
			});
		}

		const userResult = await pool.query(
			"SELECT * FROM users WHERE email=$1",
			[email],
		);
		console.log("DB user:", userResult.rows[0]);
		if (userResult.rows.length === 0) {
			return res.status(401).json({
				success: false,
				message: "no user found with this email",
			});
		}
		if (userResult.rows[0].status === "pending") {
			return res.status(401).json({
				success: false,
				message: "User is pending approval from admin",
			});
		}
		if (
			userResult.rows[0].status !== "active" &&
			userResult.rows[0].role === "teacher"
		) {
			return res.status(401).json({
				success: false,
				message:
					"your account has been rejected by admin. Please contact support for more info.",
			});
		}
		const user = userResult.rows[0];
		if (typeof user.password_hash !== "string" || !user.password_hash) {
			console.error(`Login attempt for user ${user.email} with no password hash set.`);
			return res.status(401).json({
				success: false,
				message: "Invalid credentials",
			});
		}

		const match = await bcrypt.compare(password, user.password_hash);

		if (!match) {
			return res.status(401).json({
				success: false,
				message: "Invalid credentials",
			});
		}

		const token = jwt.sign(
			{ user_id: user.user_id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_EXPIRES },
		);

		res.json({
			success: true,
			token,
			user: {
				id: user.user_id,
				name: user.full_name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (err) {
		console.error("LOGIN ERROR:", err);
		const dbMessage = getDatabaseErrorMessage(err);
		if (dbMessage) {
			return res.status(503).json({ success: false, message: dbMessage });
		}
		return res.status(500).json({
			success: false,
			message: "Login failed due to a server error.",
			stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
		});
	}
};
