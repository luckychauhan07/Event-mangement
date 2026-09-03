import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/protectedRoutes";
import UserDashboard from "../pages/user/userDashboard";
import UserEvents from "../pages/user/userEvents";
import UserEventDetails from "../pages/user/userEventDetails";
import UserRegistrations from "../pages/user/userRegistrations";
import UserProfile from "../pages/user/userProfile";
import UserNotifications from "../pages/user/userNotifications";
import UserLayout from "../layouts/userLayout";
import UserEventRegistration from "../pages/user/userEventRegistration";

const UserRoutes = () => {
	return (
		<ProtectedRoute>
			<Routes>
				<Route element={<UserLayout />}>
					<Route path="" element={<UserDashboard />} />
					<Route path="dashboard" element={<UserDashboard />} />
					<Route path="events" element={<UserEvents />} />
					<Route path="events/:id" element={<UserEventDetails />} />
					<Route
						path="events/:id/register"
						element={<UserEventRegistration />}
					/>
					<Route
						path="registrations"
						element={<UserRegistrations />}
					/>
					<Route
						path="notifications"
						element={<UserNotifications />}
					/>
					<Route path="profile" element={<UserProfile />} />
					<Route path="*" element={<div>Page Not Found</div>} />
				</Route>
			</Routes>
		</ProtectedRoute>
	);
};

export default UserRoutes;
