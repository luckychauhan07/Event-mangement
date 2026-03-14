import { useState } from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ sidebarOpen, closeSidebar, menu, role }) => {
	const navItem = "block px-4 py-2 rounded-lg transition hover:bg-white/10";

	const active = "bg-white/20";
	const [activeItem, setActiveItem] = useState("dashboard");
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
				<h2 className="text-xl font-semibold mb-6">{role} Panel</h2>
				<nav className="flex flex-col gap-2">
					{menu.map((item, index) => {
						const Icon = item.icon;

						return (
							<NavLink
								key={index}
								to={item.path}
								onClick={() => {
									setActiveItem(item.key);
								}}
								className={({ isActive }) =>
									`${navItem} ${activeItem === item.key ? active : ""}`
								}
							>
								{/* <Icon size={18} /> */}

								{item.title}
							</NavLink>
						);
					})}
				</nav>
			</aside>
		</>
	);
};

export default Sidebar;
