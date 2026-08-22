import { Bell, Compass, Menu, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { logout } from "../../utils/auth";
import { getStoredUser } from "../../utils/userAuth";

const UserHeader = ({ toggleSidebar }) => {
	const location = useLocation();
	const storedUser = getStoredUser();
	const displayName =
		storedUser?.full_name ||
		storedUser?.name ||
		storedUser?.username ||
		storedUser?.email?.split("@")?.[0] ||
		"Guest";
	const initials = displayName
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const pageLabel = (() => {
		if (location.pathname.includes("/events/")) return "Event Details";
		if (location.pathname.includes("/events")) return "Events";
		if (location.pathname.includes("/registrations")) return "Registrations";
		if (location.pathname.includes("/notifications")) return "Notifications";
		if (location.pathname.includes("/profile")) return "Profile";
		return "Dashboard";
	})();

	return (
		<header className="border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<button
						onClick={toggleSidebar}
						className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 transition hover:bg-slate-100 lg:hidden"
					>
						<Menu size={20} />
					</button>

					<div className="flex items-center gap-3">
						<div className="grid h-10 w-10 place-items-center rounded-2xl bg-linear-to-br from-blue-700 to-indigo-700 text-sm font-bold text-white shadow-sm">
							EE
						</div>
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
								User Module
							</p>
							<p className="text-base font-semibold text-slate-900">
								{pageLabel}
							</p>
						</div>
					</div>
				</div>

				<div className="hidden min-w-[260px] items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 md:flex">
					<Search size={16} className="text-slate-400" />
					<input
						type="text"
						placeholder="Search inside user module..."
						className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
					/>
				</div>

				<div className="flex items-center gap-3">
					<Link
						to="/user/events"
						className="hidden rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 transition hover:bg-slate-100 md:inline-flex"
						title="Explore events"
					>
						<Compass size={18} />
					</Link>

					<Link
						to="/user/notifications"
						className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 transition hover:bg-slate-100"
						title="Notifications"
					>
						<Bell size={18} />
					</Link>

					<div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
						<div className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-br from-blue-600 to-violet-700 text-sm font-semibold text-white">
							{initials}
						</div>
						<div className="hidden text-left sm:block">
							<p className="text-sm font-semibold text-slate-900">
								{displayName}
							</p>
							<p className="text-xs text-slate-500">User Account</p>
						</div>
					</div>

					<button
						onClick={logout}
						className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
					>
						Logout
					</button>
				</div>
			</div>
		</header>
	);
};

export default UserHeader;
