import { Routes, Route } from "react-router-dom";
import AdminRoute from "../components/admin/adminProtectionRoutes";
import AdminDashboard from "../pages/admin/adminDashboard";
import AdminLayout from "../layouts/adminLayout";
import AdminTeacherApprovals from "../pages/admin/adminTeacherApprovals";
import AddEvent from "../pages/admin/addEvent";
import EventList from "../pages/admin/eventsList";

const AdminRoutes = () => {
	return (
		<AdminRoute>
			<Routes>
				<Route element={<AdminLayout />}>
					<Route path="" element={<AdminDashboard />} />
					<Route path="events" element={<EventList />} />
					{/* <Route path="event/:id" element={<EventDetails />} />
					<Route path="event/:id/edit" element={<EditEvent />} /> */}
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
