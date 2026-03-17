import { Outlet } from "react-router-dom";
import AdminHeader from "../components/header/header";
import { useState } from "react";
import Sidebar from "../components/sidebar/sidebar";
import { teacherMenu } from "../utils/sidebarMenu";

const TeacherLayout = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	return (
		<>
			<div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
				<AdminHeader
					toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
				/>

				<div className="flex flex-1 min-h-0">
					<Sidebar
						menu={teacherMenu}
						sidebarOpen={sidebarOpen}
						closeSidebar={() => setSidebarOpen(false)}
						role="Teacher"
					/>
					<main className="p-6 flex-1 min-h-0 overflow-y-auto">
						<Outlet />
					</main>
				</div>
			</div>
		</>
	);
};

export default TeacherLayout;
