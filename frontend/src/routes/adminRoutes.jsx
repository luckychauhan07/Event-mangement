import { Routes, Route } from "react-router-dom";
import AdminRoute from "../components/admin/adminProtectionRoutes";
import AdminDashboard from "../pages/admin/adminDashboard";
import AdminLayout from "../layouts/adminLayout";
import AdminTeacherApprovals from "../pages/admin/adminTeacherApprovals";
import AddEvent from "../pages/admin/addEvent";
import EventList from "../pages/admin/eventsList";
import EventDetails from "../pages/admin/eventDetails";
import Users from "@/pages/admin/users";
import EditUser from "@/pages/admin/editUser";
import UserDetails from "@/pages/admin/userDetails";

const AdminRoutes = () => {
	return (
		<AdminRoute>
			<Routes>
				<Route element={<AdminLayout />}>
					<Route path="" element={<AdminDashboard />} />
					<Route path="events" element={<EventList />} />
					<Route path="events/:id" element={<EventDetails />} />
					{/* <Route path="event/:id/edit" element={<EditEvent />} /> */}
					<Route path="add-event" element={<AddEvent />} />
					<Route path="users" element={<Users />} />
					<Route path="users/:id" element={<UserDetails />} />
					<Route path="users/:id/edit" element={<EditUser />} />
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
