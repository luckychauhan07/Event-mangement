import { Routes, Route } from "react-router-dom";

import TeacherRoute from "../components/taecherProtectionRoutes";
import TeacherDashboard from "../pages/teacher/teacherDashboard";
import TeacherLayout from "../layouts/teacherLayout";
import EventList from "@/pages/teacher/eventsList";
import AddEvent from "@/pages/admin/addEvent";
import EventDetails from "@/pages/teacher/eventDetails";
import ManageEvent from "@/pages/teacher/manageEvent";

const TeacherRoutes = () => {
	return (
		<TeacherRoute>
			<Routes>

				<Route element={<TeacherLayout />}>
					<Route path="dashboard" element={<TeacherDashboard />} />
					<Route path="events" element={<EventList />} />
					<Route path="events/view/:id" element={<EventDetails />} />
					<Route path="events/:id" element={<EventDetails />} />
					<Route
	path="events/:id/manage"
	element={<ManageEvent />}
/>
					<Route path="events/edit/:id" element={<AddEvent />} />
					<Route path="add-event" element={<AddEvent />} />
				</Route>

			</Routes>
		</TeacherRoute>
	);
};

export default TeacherRoutes;