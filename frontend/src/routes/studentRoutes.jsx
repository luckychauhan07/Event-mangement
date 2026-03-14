import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/protectedRoutes";
import StudentDashboard from "../pages/student/studentDashboard";
import StudentLayout from "../layouts/studentLayout";

const StudentRoutes = () => {
	return (
		<ProtectedRoute>
			<Routes>
				<Route element={<StudentLayout />}>
					<Route path="dashboard" element={<StudentDashboard />} />
				</Route>
			</Routes>
		</ProtectedRoute>
	);
};

export default StudentRoutes;
