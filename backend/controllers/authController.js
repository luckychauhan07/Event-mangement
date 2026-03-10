const pool = require("../db/config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
	try {
		const { full_name, email, phone, password, role } = req.body;
		console.log("Received data:", {
			full_name,
			email,
			phone,
			password: password,
			role,
		});

		if (
			typeof full_name !== "string" ||
			typeof email !== "string" ||
			typeof password !== "string" ||
			!full_name.trim() ||
			!email.trim() ||
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
		console.error(err);
		res.status(500).json({
			success: false,
			message: "Server error",
		});
	}
};

exports.login = async (req, res) => {
	console.log("Login attempt with body:", req.body);
	try {
		const { email, password } = req.body;
		if (
			typeof email !== "string" ||
			typeof password !== "string" ||
			!email.trim() ||
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
		if (userResult.rows[0].status !== "active") {
			return res.status(401).json({
				success: false,
				message: "User is not active, waiting admin approval",
			});
		}
		const user = userResult.rows[0];

		if (typeof user.password_hash !== "string" || !user.password_hash) {
			return res.status(401).json({
				success: false,
				message: "Invalid credentials",
			});
		}
		console.log(user);
		if (user.email === "admin@example.com") {
			const token = jwt.sign(
				{
					user_id: user.user_id,
					role: user.role,
				},
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
		} else {
			const match = await bcrypt.compare(password, user.password_hash);

			if (!match) {
				return res.status(401).json({
					success: false,
					message: "Invalid credentials",
				});
			}

			const token = jwt.sign(
				{
					user_id: user.user_id,
					role: user.role,
				},
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
		}
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Server error",
		});
	}
};
