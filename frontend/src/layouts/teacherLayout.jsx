import { Outlet } from "react-router-dom";
import AdminHeader from "../components/header/header";
import { useState } from "react";
import Sidebar from "../components/sidebar/sidebar";
import { teacherMenu } from "../utils/sidebarMenu";

const TeacherLayout = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	return (
		<>
			<div className="min-h-screen bg-slate-100">
				<AdminHeader
					toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
				/>

				<div className="flex">
					<Sidebar
						menu={teacherMenu}
						sidebarOpen={sidebarOpen}
						closeSidebar={() => setSidebarOpen(false)}
						role="Teacher"
					/>
					<main className="p-6 flex-1 overflow-y-auto">
						<Outlet />
					</main>
				</div>
			</div>
		</>
	);
};

export default TeacherLayout;
