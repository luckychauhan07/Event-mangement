import { Routes, Route } from "react-router-dom";
import AdminRoute from "../components/admin/adminProtectionRoutes";
import AdminDashboard from "../pages/admin/adminDashboard";
import AdminLayout from "../layouts/adminLayout";
import AdminTeacherApprovals from "../pages/admin/adminTeacherApprovals";
import EventApprovals from "../pages/admin/eventApprovals";
import AddEvent from "../pages/admin/addEvent";
import EventList from "../pages/admin/eventsList";
import EventDetails from "../pages/admin/eventDetails";
import Users from "@/pages/admin/users";
import EditUser from "@/pages/admin/editUser";
import UserDetails from "@/pages/admin/userDetails";
import Notifications from "@/pages/admin/notifications";
import AdminProfile from "@/pages/admin/adminProfile";
import CompleteAdminProfile from "@/pages/admin/completeAdminProfile";
import EditAdminProfile from "@/pages/admin/editAdminProfile";
import EditEvent from "@/pages/admin/editEvent";
import EventCoordinator from "@/pages/admin/eventCoordinator";
import EventParticipants from "@/pages/admin/eventParticipants";

const AdminRoutes = () => {
	return (
		<AdminRoute>
			<Routes>
				<Route element={<AdminLayout />}>
					<Route path="" element={<AdminDashboard />} />
					<Route path="events" element={<EventList />} />
					<Route path="events/:id" element={<EventDetails />} />
					<Route path="events/:id/edit" element={<EditEvent />} />
					<Route path="add-event" element={<AddEvent />} />
					<Route path="users" element={<Users />} />
					<Route path="users/:id" element={<UserDetails />} />
					<Route
						path="events/:id/participants"
						element={<EventParticipants />}
					/>
					<Route path="users/:id/edit" element={<EditUser />} />
					<Route path="notifications" element={<Notifications />} />
					<Route
						path="teacher-approvals"
						element={<AdminTeacherApprovals />}
					/>
					<Route
						path="event-approvals"
						element={<EventApprovals />}
					/>
					<Route
						path="reports"
						element={<div>Admin Reports Page (Coming Soon)</div>}
					/>
					<Route path="profile" element={<AdminProfile />} />
					<Route
						path="profile/completion"
						element={<CompleteAdminProfile />}
					/>
					<Route path="profile/edit" element={<EditAdminProfile />} />
					<Route path="*" element={<div>Page Not Found</div>} />
				</Route>
			</Routes>
		</AdminRoute>
	);
};

export default AdminRoutes;
