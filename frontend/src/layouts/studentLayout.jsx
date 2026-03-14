import { Outlet } from "react-router-dom";
import AdminHeader from "../components/header/header";
import { useState } from "react";
import Sidebar from "../components/sidebar/sidebar";
import { studentMenu } from "../utils/sidebarMenu";

const StudentLayout = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	return (
		<>
			<div className="min-h-screen bg-slate-100">
				<AdminHeader
					toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
				/>

				<div className="flex">
					<Sidebar
						menu={studentMenu}
						sidebarOpen={sidebarOpen}
						closeSidebar={() => setSidebarOpen(false)}
						role="Student"
					/>
					<main className="p-6 flex-1 overflow-y-auto">
						<Outlet />
					</main>
				</div>
			</div>
		</>
	);
};

export default StudentLayout;
