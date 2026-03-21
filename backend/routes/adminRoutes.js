const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

router.get(
	"/pending-teachers",
	authMiddleware,
	adminMiddleware,
	adminController.getPendingTeachers,
);
router.get("/users", authMiddleware, adminMiddleware, adminController.getUsers);
router.patch(
	"/users/:id/approve",
	authMiddleware,
	adminMiddleware,
	adminController.approveTeacher,
);

module.exports = router;
