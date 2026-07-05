import { Routes, Route } from "react-router-dom";

import TeacherRoute from "../components/taecherProtectionRoutes";
import TeacherDashboard from "../pages/teacher/teacherDashboard";
import TeacherLayout from "../layouts/teacherLayout";
import EventList from "@/pages/teacher/eventsList";
import AddEvent from "@/pages/admin/addEvent";
import EventDetails from "@/pages/teacher/eventDetails";

const TeacherRoutes = () => {
	return (
		<TeacherRoute>
			<Routes>
				<Route element={<TeacherLayout />}>
					<Route path="dashboard" element={<TeacherDashboard />} />
				</Route>
				<Route element={<TeacherLayout />}>
					<Route path="events" element={<EventList />} />
				</Route>
				<Route
	path="events/:id"
	element={<EventDetails />}
/>
				<Route element={<TeacherLayout />}>
					<Route path="add-event" element={<AddEvent />} />
				</Route>
			</Routes>
		</TeacherRoute>
	);
};

export default TeacherRoutes;
