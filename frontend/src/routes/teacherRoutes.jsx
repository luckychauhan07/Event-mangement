import { Routes, Route } from "react-router-dom";

import TeacherRoute from "../components/taecherProtectionRoutes";
import TeacherDashboard from "../pages/teacher/teacherDashboard";
import TeacherLayout from "../layouts/teacherLayout";
import EventList from "@/pages/teacher/eventsList";
import AddEvent from "@/pages/admin/addEvent";
import EventDetails from "@/pages/teacher/eventDetails";
import ManageEvent from "@/pages/teacher/manageEvent";
import EditEvent from "@/pages/admin/editEvent";
import EventParticipants from "@/pages/admin/eventParticipants";
import TeacherProfile from "@/pages/teacher/teacherProfile";

const TeacherRoutes = () => {
	return (
		<TeacherRoute>
			<Routes>
				<Route element={<TeacherLayout />}>
					<Route path="" element={<TeacherDashboard />} />
					<Route path="events" element={<EventList />} />
					<Route path="events/assigned" element={<EventList />} />
					<Route
						path="events/all"
						element={<EventList showAllEvents />}
					/>
					<Route path="events/view/:id" element={<EventDetails />} />
					<Route
						path="events/:id/participants"
						element={<EventParticipants />}
					/>
					<Route path="events/:id" element={<EventDetails />} />
					<Route path="events/:id/manage" element={<ManageEvent />} />
					<Route path="events/:id/edit" element={<EditEvent />} />
					<Route path="add-event" element={<AddEvent />} />
					<Route path="profile" element={<TeacherProfile />} />
					<Route path="*" element={<div>Page Not Found</div>} />
				</Route>
			</Routes>
		</TeacherRoute>
	);
};

export default TeacherRoutes;
