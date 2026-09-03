import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
	CalendarPlus,
	Users,
	ClipboardCheck,
	Bell,
	ArrowUpRight,
	RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAdminDashboardSummary } from "../../services/adminServices";

const AdminDashboard = () => {
	const [dashboard, setDashboard] = useState(null);
	const [loading, setLoading] = useState(true);

	const loadDashboard = async () => {
		try {
			setLoading(true);
			setDashboard(await getAdminDashboardSummary());
		} catch (error) {
			console.error("Error loading admin dashboard:", error);
			toast.error("Unable to load dashboard data.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadDashboard();
	}, []);

	const stats = dashboard?.stats || {};
	const recentEvents = dashboard?.recentEvents || [];
	const pendingCount =
		(stats.pendingTeachers || 0) + (stats.pendingEvents || 0);
	const formatDate = (date) =>
		new Date(date).toLocaleDateString("en-IN", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});

	return (
		<main className="flex-1 p-6 lg:p-8">
			<div className="flex flex-col gap-6">
				<div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur px-6 py-5 shadow-sm">
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div>
							<h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
								Operations Dashboard
							</h1>
							<p className="text-sm text-slate-500">
								Live overview of your users, event calendar, and
								approval queues.
							</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<button
								type="button"
								onClick={loadDashboard}
								disabled={loading}
								className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 disabled:cursor-wait disabled:opacity-60"
							>
								<RefreshCw
									size={16}
									className={loading ? "animate-spin" : ""}
								/>
								Refresh
							</button>
							<Link
								to="/admin/teacher-approvals"
								className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
							>
								<ClipboardCheck size={16} />
								Pending Approvals
							</Link>
							<Link
								to="/admin/add-event"
								className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
							>
								<CalendarPlus size={16} />
								Create Event
							</Link>
						</div>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex items-center justify-between">
							<div className="rounded-xl bg-slate-100 p-2 text-slate-700">
								<Users size={18} />
							</div>
							<span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
								Users
							</span>
						</div>
						<p className="mt-4 text-2xl font-semibold text-slate-900">
							{loading ? "..." : (stats.totalUsers ?? 0)}
						</p>
						<p className="text-xs text-slate-500">
							{stats.pendingTeachers ?? 0} teacher approvals
							pending
						</p>
					</div>
					<div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex items-center justify-between">
							<div className="rounded-xl bg-blue-50 p-2 text-blue-600">
								<ClipboardCheck size={18} />
							</div>
							<span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
								Approvals
							</span>
						</div>
						<p className="mt-4 text-2xl font-semibold text-slate-900">
							{loading ? "..." : pendingCount}
						</p>
						<p className="text-xs text-slate-500">
							{stats.pendingEvents ?? 0} event requests,{" "}
							{stats.pendingTeachers ?? 0} teachers
						</p>
					</div>
					<div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex items-center justify-between">
							<div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
								<CalendarPlus size={18} />
							</div>
							<span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
								Events
							</span>
						</div>
						<p className="mt-4 text-2xl font-semibold text-slate-900">
							{loading ? "..." : (stats.totalEvents ?? 0)}
						</p>
						<p className="text-xs text-slate-500">
							{stats.upcomingEvents ?? 0} upcoming
						</p>
					</div>
					<div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex items-center justify-between">
							<div className="rounded-xl bg-amber-50 p-2 text-amber-600">
								<Bell size={18} />
							</div>
							<span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
								Alerts
							</span>
						</div>
						<p className="mt-4 text-2xl font-semibold text-slate-900">
							{loading ? "..." : (stats.totalRegistrations ?? 0)}
						</p>
						<p className="text-xs text-slate-500">
							Registered or confirmed participants
						</p>
					</div>
				</div>

				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="text-lg font-semibold text-slate-900">
								Recently created events
							</h2>
							<p className="text-sm text-slate-500">
								Latest activity from the event calendar.
							</p>
						</div>
						<Link
							to="/admin/events"
							className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-emerald-700"
						>
							View all <ArrowUpRight size={15} />
						</Link>
					</div>
					<div className="mt-5 divide-y divide-slate-100">
						{recentEvents.length === 0 ? (
							<p className="py-6 text-sm text-slate-500">
								No events have been created yet.
							</p>
						) : (
							recentEvents.map((event) => (
								<Link
									key={event.id}
									to={`/admin/events/${event.id}`}
									className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:bg-slate-50"
								>
									<div className="min-w-0">
										<p className="truncate text-sm font-semibold text-slate-800">
											{event.title}
										</p>
										<p className="mt-1 text-xs text-slate-500">
											{event.category || "Uncategorized"}{" "}
											· {formatDate(event.start_at)}
										</p>
									</div>
									<span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
										{event.status}
									</span>
								</Link>
							))
						)}
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-slate-900">
								Quick Actions
							</h2>
							<span className="text-xs text-slate-400">
								Last 7 days
							</span>
						</div>
						<div className="mt-4 grid gap-3 sm:grid-cols-2">
							<Link
								to="/admin/teacher-approvals"
								className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
							>
								<span className="inline-flex items-center gap-2">
									<ClipboardCheck size={16} />
									Review Approvals
								</span>
								<ArrowUpRight
									size={16}
									className="text-slate-400 transition group-hover:text-slate-700"
								/>
							</Link>
							<Link
								to="/admin/event-approvals"
								className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
							>
								<span className="inline-flex items-center gap-2">
									<ClipboardCheck size={16} />
									Event Requests
								</span>
								<ArrowUpRight
									size={16}
									className="text-slate-400 transition group-hover:text-slate-700"
								/>
							</Link>
							<Link
								to="/admin/users"
								className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
							>
								<span className="inline-flex items-center gap-2">
									<Users size={16} />
									Manage Users
								</span>
								<ArrowUpRight
									size={16}
									className="text-slate-400 transition group-hover:text-slate-700"
								/>
							</Link>
							<Link
								to="/admin/events"
								className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
							>
								<span className="inline-flex items-center gap-2">
									<CalendarPlus size={16} />
									Plan Event
								</span>
								<ArrowUpRight
									size={16}
									className="text-slate-400 transition group-hover:text-slate-700"
								/>
							</Link>
							<Link
								to="/admin/notifications"
								className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
							>
								<span className="inline-flex items-center gap-2">
									<Bell size={16} />
									Send Notification
								</span>
								<ArrowUpRight
									size={16}
									className="text-slate-400 transition group-hover:text-slate-700"
								/>
							</Link>
						</div>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-slate-900">
							System Status
						</h2>
						<ul className="mt-4 space-y-3 text-sm text-slate-600">
							<li className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
								<span>API</span>
								<span className="text-emerald-600 font-medium">
									Operational
								</span>
							</li>
							<li className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
								<span>Payments</span>
								<span className="text-amber-600 font-medium">
									Degraded
								</span>
							</li>
							<li className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
								<span>Notifications</span>
								<span className="text-emerald-600 font-medium">
									Operational
								</span>
							</li>
						</ul>
						<p className="mt-4 text-xs text-slate-400">
							Update: 10 minutes ago
						</p>
					</div>
				</div>
			</div>
		</main>
	);
};
export default AdminDashboard;
