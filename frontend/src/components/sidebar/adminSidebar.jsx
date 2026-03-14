import { useState } from "react";
import { NavLink } from "react-router-dom";

const AdminSidebar = ({ sidebarOpen, closeSidebar }) => {
	const navItem = "block px-4 py-2 rounded-lg transition hover:bg-white/10";

	const active = "bg-white/20";
	const [activeItem, setActiveItem] = useState("");
	return (
		<>
			{/* Mobile Overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-black/30 lg:hidden"
					onClick={closeSidebar}
				/>
			)}

			<aside
				className={`
				fixed lg:static z-40
				w-64 h-screen
				bg-gradient-to-b from-blue-700 to-blue-900
				text-white p-6
				transform transition-transform
				${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
				lg:translate-x-0
			`}
			>
				<h2 className="text-xl font-semibold mb-6">Admin Panel</h2>

				<nav className="flex flex-col gap-2">
					<NavLink
						onClick={() => {
							setActiveItem("dashboard");
						}}
						to="/admin"
						className={({ isActive }) =>
							`${navItem} ${activeItem === "dashboard" ? active : ""}`
						}
					>
						🏠 Dashboard
					</NavLink>

					<NavLink
						onClick={() => {
							setActiveItem("users");
						}}
						to="/admin/users"
						className={({ isActive }) =>
							`${navItem} ${activeItem === "users" ? active : ""}`
						}
					>
						👥 Users
					</NavLink>

					<NavLink
						onClick={() => {
							setActiveItem("events");
						}}
						to="/admin/events"
						className={({ isActive }) =>
							`${navItem} ${activeItem === "events" ? active : ""}`
						}
					>
						📅 Events
					</NavLink>

					<NavLink
						onClick={() => {
							setActiveItem("add-event");
						}}
						to="/admin/add-event"
						className={({ isActive }) =>
							`${navItem} ${activeItem === "add-event" ? active : ""}`
						}
					>
						➕ Add Event
					</NavLink>

					<NavLink
						onClick={() => {
							setActiveItem("reports");
						}}
						to="/admin/reports"
						className={({ isActive }) =>
							`${navItem} ${activeItem === "reports" ? active : ""}`
						}
					>
						📊 Reports
					</NavLink>

					<NavLink
						onClick={() => {
							setActiveItem("notifications");
						}}
						to="/admin/notifications"
						className={({ isActive }) =>
							`${navItem} ${activeItem === "notifications" ? active : ""}`
						}
					>
						🔔 Notifications
					</NavLink>

					<NavLink
						onClick={() => {
							setActiveItem("profile");
						}}
						to="/admin/profile"
						className={({ isActive }) =>
							`${navItem} ${activeItem === "profile" ? active : ""}`
						}
					>
						👤 Profile
					</NavLink>
				</nav>
			</aside>
		</>
	);
};

export default AdminSidebar;
