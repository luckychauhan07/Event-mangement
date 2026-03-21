module.exports = function (req, res, next) {
	if (req.user.role !== "admin") {
		return res.status(403).json({
			success: false,
			message: "Admin access required",
		});
	}
	console.log("Admin access granted for user:", req.user.email, req.url);
	next();
};
