import { Link, Outlet, useLocation } from "react-router-dom";
import { userMenu } from "../../utils/sidebarMenu";
import { logout } from "../../utils/auth";
import { LogOut } from "lucide-react";
import { useMemo } from "react";
import { getCurrentUserProfile } from "../../utils/userEventUtils";

const UserLayout = () => {
	const location = useLocation();
	const user = useMemo(() => getCurrentUserProfile(), []);

	const displayName =
		user?.full_name ||
		user?.name ||
		user?.username ||
		user?.email?.split("@")?.[0] ||
		"Guest";

	return (
		<div className="flex min-h-screen bg-slate-50">
			{/* Sidebar */}
			<aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white p-6 shadow-sm">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
						E
					</div>
					<h2 className="text-xl font-bold text-slate-800">EventEase</h2>
				</div>

				<nav className="mt-10 space-y-2">
					{userMenu.map((item) => {
						const isActive = location.pathname === item.path;
						return (
							<Link
								key={item.key}
								to={item.path}
								className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
									isActive
										? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
										: "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
								}`}
							>
								<item.icon size={18} />
								{item.title}
							</Link>
						);
					})}
				</nav>

				<div className="absolute bottom-6 left-6 right-6">
					<div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
						<p className="font-semibold">{displayName}</p>
						<p className="text-xs text-slate-500">{user?.email}</p>
					</div>
					<button
						onClick={logout}
						className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
					>
						<LogOut size={18} />
						Logout
					</button>
				</div>
			</aside>

			{/* Main Content */}
			<main className="ml-64 flex-1 p-8">
				<Outlet />
			</main>
		</div>
	);
};

export default UserLayout;