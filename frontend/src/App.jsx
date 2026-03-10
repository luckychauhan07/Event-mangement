import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Signup from "./pages/signup";
import ProtectedRoute from "./components/protectedRoutes";
import AdminTeacherApprovals from "./pages/adminTeacherApprovals";
import AdminRoute from "./components/adminRoutes";
import StudentDashboard from "./pages/studentDashboard";
import AdminDashboard from "./pages/adminDashboard";
import TeacherRoute from "./components/taecherRoutes";
import TeacherDashboard from "./pages/teacherDashboard";
import GuestRoute from "./components/guestRoutes";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/"
					element={
						<GuestRoute>
							<Login />
						</GuestRoute>
					}
				/>

				<Route
					path="/signup"
					element={
						<GuestRoute>
							<Signup />
						</GuestRoute>
					}
				/>
				<Route
					path="/student/dashboard"
					element={
						<ProtectedRoute>
							<StudentDashboard />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/dashboard"
					element={
						<AdminRoute>
							<AdminDashboard />
						</AdminRoute>
					}
				/>
				<Route
					path="/teacher/dashboard"
					element={
						<TeacherRoute>
							<TeacherDashboard />
						</TeacherRoute>
					}
				/>
				<Route
					path="/admin/teacher-approvals"
					element={
						<AdminRoute>
							<AdminTeacherApprovals />
						</AdminRoute>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
