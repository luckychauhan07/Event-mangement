import { Routes, Route } from "react-router-dom";
import AdminRoute from "../components/admin/adminProtectionRoutes";
import AdminDashboard from "../pages/admin/adminDashboard";
import AdminLayout from "../layouts/adminLayout";
import AdminTeacherApprovals from "../pages/admin/adminTeacherApprovals";
import AddEvent from "../pages/admin/addEvent";

const AdminRoutes = () => {
	return (
		<AdminRoute>
			<Routes>
				<Route element={<AdminLayout />}>
					<Route path="" element={<AdminDashboard />} />
					<Route path="add-event" element={<AddEvent />} />
					<Route
						path="teacher-approvals"
						element={<AdminTeacherApprovals />}
					/>
				</Route>
			</Routes>
		</AdminRoute>
	);
};

export default AdminRoutes;
