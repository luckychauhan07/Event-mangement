import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthRoutes from "./routes/authRoutes";
import AdminRoutes from "./routes/adminRoutes";
import TeacherRoutes from "./routes/teacherRoutes";
import StudentRoutes from "./routes/studentRoutes";

function App() {
	return (
		<>
			<Toaster
				position="top-right"
				reverseOrder={false}
				gutter={12}
				containerStyle={{ top: 20, right: 20 }}
				toastOptions={{
					duration: 4000,
					className:
						"rounded-xl border border-slate-200 bg-white text-slate-800 shadow-lg",
					style: {
						padding: "12px 14px",
						fontSize: "14px",
						fontWeight: 500,
						maxWidth: "420px",
					},
					success: {
						duration: 3200,
						className:
							"rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-lg",
					},
					error: {
						duration: 4500,
						className:
							"rounded-xl border border-rose-200 bg-rose-50 text-rose-800 shadow-lg",
					},
				}}
			/>
			<BrowserRouter>
				<Routes>
					<Route path="/*" element={<AuthRoutes />} />

					<Route path="/admin/*" element={<AdminRoutes />} />

					<Route path="/teacher/*" element={<TeacherRoutes />} />

					<Route path="/student/*" element={<StudentRoutes />} />
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
