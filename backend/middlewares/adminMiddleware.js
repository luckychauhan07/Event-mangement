exports.adminMiddleware = function (req, res, next) {
	if (req.user.role !== "admin") {
		return res.status(403).json({
			success: false,
			message: "Admin access required",
		});
	}
	next();
};

exports.teacherMiddleware = function (req, res, next) {
	if (req.user.role !== "teacher") {
		return res.status(403).json({
			success: false,
			message: "Teacher access required",
		});
	}
	next();
};

exports.adminTeacherMiddleware = function (req, res, next) {
	if (req.user.role == "admin" || req.user.role == "teacher") {
		next();
	} else {
		return res.status(403).json({
			success: false,
			message: "Admin or teacher access required",
		});
	}
};
