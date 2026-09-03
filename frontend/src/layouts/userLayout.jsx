import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/sidebar/sidebar";
import { userMenu } from "../utils/sidebarMenu";
import UserHeader from "../components/header/userHeader";

const UserLayout = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	return (
		<>
			<div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
				<UserHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

				<div className="flex flex-1 min-h-0">
					<Sidebar
						menu={userMenu}
						sidebarOpen={sidebarOpen}
						closeSidebar={() => setSidebarOpen(false)}
						role="User"
					/>
					<main className="p-6 flex-1 min-h-0 overflow-y-auto">
						<Outlet />
					</main>
				</div>
			</div>
		</>
	);
};

export default UserLayout;
