const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

router.use(authMiddleware, adminMiddleware);

// ADMIN PROFILE ROUTES
router.get("/profile/incomplete", adminController.getAdminProfileSummary);
router.get("/profile", adminController.getAdminProfile);
router.put("/profile", adminController.updateAdminProfile);
router.patch("/profile", adminController.patchAdminProfile);

// TEACHER APPROVALS
router.get("/teachers-approvals", adminController.getPendingTeachers);
router.patch("/teachers-approvals/:id/reject", adminController.teacherAction);
router.patch("/teachers-approvals/:id/approve", adminController.teacherAction);

// USER MANAGEMENT

router.get("/users", adminController.getUsers); // get all users for admin dashboard
router.get("/users/:id", adminController.getUserDetails); //get user details for admin dashboard
router.put("/users/:id", adminController.updateUser); // update user details
router.delete("/users/:id", adminController.deleteUser); // delete user
router.patch("/users/:id/action", adminController.changeUserStatus); // change user status

module.exports = router;
