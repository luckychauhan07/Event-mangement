import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/sidebar/adminSidebar";
import AdminHeader from "../components/header/adminheader";
import { useState } from "react";

const AdminLayout = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	return (
		<>
			<div className="min-h-screen bg-slate-100">
				<AdminHeader
					toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
				/>

				<div className="flex">
					<AdminSidebar
						sidebarOpen={sidebarOpen}
						closeSidebar={() => setSidebarOpen(false)}
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
