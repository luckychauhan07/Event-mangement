exports.adminMiddleware = function (req, res, next) {
	if (req.user.role !== "admin") {
		return res.status(403).json({
			success: false,
			message: "Admin access required",
		});
	}
	console.log("Admin access granted for user:", req.user.email, req.url);
	next();
};

exports.teacherMiddleware = function (req, res, next) {
	if (req.user.role !== "teacher") {
		return res.status(403).json({
			success: false,
			message: "Teacher access required",
		});
	}
	console.log("Teacher access granted for user:", req.user.email, req.url);
	next();
};

exports.adminTeacherMiddleware = function (req, res, next) {
	console.log(
		"Checking admin or teacher access for user:",
		req.user.email,
		req.url,
	);
	if (req.user.role == "admin" || req.user.role == "teacher") {
		console.log(
			"Admin or teacher access granted for user:",
			req.user.email,
			req.url,
		);
		next();
	} else {
		return res.status(403).json({
			success: false,
			message: "Admin or teacher access required",
		});
	}
};
