import { Bell, Search, Menu } from "lucide-react";
import { logout } from "../../utils/auth";

const AdminHeader = ({ toggleSidebar }) => {
	const user = JSON.parse(localStorage.getItem("user"));
	return (
		<header className="bg-white/80 backdrop-blur border-b border-blue-200 px-6 py-3 flex items-center justify-between">
			<div className="flex items-center gap-4">
				<button
					onClick={toggleSidebar}
					className="lg:hidden p-2 rounded-lg border border-transparent hover:border-blue-200 hover:bg-blue-50 transition"
				>
					<Menu size={20} />
				</button>
				<div className="flex items-center gap-2">
					{/* <img
						src="../../../assets/react.svg"
						alt="Event Ease"
						style={{
							height: "32px",
							width: "auto",
							marginRight: "10px",
						}}
					/> */}
					<div className="w-9 h-9 bg-gradient-to-br from-blue-900 to-blue-700 text-white flex items-center justify-center rounded-lg font-bold shadow-sm">
						EE
					</div>

					<span className="font-semibold text-blue-800 tracking-wide">
						Event Ease
					</span>
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
						{user?.role || "User"} Module
					</p>
				</div>
			</div>

			<div className="flex items-center gap-4">
				<div className="hidden md:flex items-center border border-blue-200 rounded-xl px-3 py-1.5 bg-blue-50 shadow-sm">
					<Search size={16} className="text-blue-400" />

					<input
						type="text"
						placeholder="Search..."
						className="bg-transparent outline-none text-sm px-2 text-blue-700 placeholder:text-blue-400"
					/>
				</div>

				<button className="relative p-2 rounded-lg border border-transparent hover:border-blue-200 hover:bg-blue-50 transition">
					<Bell size={20} />
				</button>

				<div className="flex items-center gap-2">
					<div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-sm shadow-sm">
						{user?.name?.charAt(0) || "A"}
					</div>

					<span className="hidden md:block text-sm font-medium text-blue-700">
						{user?.name || "Adm"}
					</span>
				</div>

				<button
					onClick={logout}
					className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100 hover:shadow-md"
				>
					Logout
				</button>
			</div>
		</header>
	);
};

export default AdminHeader;
