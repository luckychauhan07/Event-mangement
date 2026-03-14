import { Routes, Route } from "react-router-dom";

import TeacherRoute from "../components/taecherProtectionRoutes";
import TeacherDashboard from "../pages/teacher/teacherDashboard";
import TeacherLayout from "../layouts/teacherLayout";

const TeacherRoutes = () => {
	return (
		<TeacherRoute>
			<Routes>
				<Route element={<TeacherLayout />}>
					<Route path="dashboard" element={<TeacherDashboard />} />
				</Route>
			</Routes>
		</TeacherRoute>
	);
};

export default TeacherRoutes;
