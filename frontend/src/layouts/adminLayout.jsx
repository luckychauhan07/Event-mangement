import { Outlet } from "react-router-dom";
import AdminHeader from "../components/header/header";
import { useState } from "react";
import { adminMenu } from "../utils/sidebarMenu";
import Sidebar from "../components/sidebar/sidebar";

const AdminLayout = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	return (
		<>
			<div className="min-h-screen bg-slate-100">
				<AdminHeader
					toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
				/>

				<div className="flex">
					<Sidebar
						sidebarOpen={sidebarOpen}
						closeSidebar={() => setSidebarOpen(false)}
						menu={adminMenu}
						role="Admin"
					/>
					<main className="p-6 flex-1 overflow-y-auto">
						<Outlet />
					</main>
				</div>
			</div>
		</>
	);
};

export default AdminLayout;
