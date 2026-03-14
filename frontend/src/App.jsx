import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthRoutes from "./routes/authRoutes";
import AdminRoutes from "./routes/adminRoutes";
import TeacherRoutes from "./routes/teacherRoutes";
import StudentRoutes from "./routes/studentRoutes";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/*" element={<AuthRoutes />} />

				<Route path="/admin/*" element={<AdminRoutes />} />

				<Route path="/teacher/*" element={<TeacherRoutes />} />

				<Route path="/student/*" element={<StudentRoutes />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
