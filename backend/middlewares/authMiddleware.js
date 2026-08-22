const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
	const header = req.headers.authorization;

	// Diagnostic log to help verify whether the frontend sends the Authorization header.
	try {
		console.log(`authMiddleware: ${req.method} ${req.path} - Authorization: ${header ? 'present' : 'missing'}`);
	} catch (e) {
		// swallow logging errors
	}

	if (!header || typeof header !== "string") {
		return res.status(401).json({
			success: false,
			message: "No token provided",
		});
	}

	const parts = header.split(" ");
	const token = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : header;

	if (!token || token === "undefined" || token === "null") {
		return res.status(401).json({
			success: false,
			message: "Invalid token format",
		});
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		req.user = decoded;
		next();
	} catch (err) {
		console.error("authMiddleware token verify failed:", err.message);
		return res.status(401).json({
			success: false,
			message: "Invalid token",
		});
	}
};
