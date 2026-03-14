import { Link } from "react-router-dom";
import { useState } from "react";
import {
	CalendarPlus,
	Users,
	ClipboardCheck,
	Bell,
	ArrowUpRight,
} from "lucide-react";

const AdminDashboard = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		// <div className="min-h-screen bg-slate-100">
		// 	<AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

		// 	<div className="flex">
		// 		<AdminSidebar
		// 			sidebarOpen={sidebarOpen}
		// 			closeSidebar={() => setSidebarOpen(false)}
		// 		/>

		<main className="flex-1 p-6 lg:p-8">
			<div className="flex flex-col gap-6">
				<div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur px-6 py-5 shadow-sm">
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div>
							<h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
								Admin Dashboard
							</h1>
							<p className="text-sm text-slate-500">
								Welcome back. Manage approvals, users, and
								events.
							</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<Link
								to="/admin/teacher-approvals"
								className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
							>
								<ClipboardCheck size={16} />
								Pending Approvals
							</Link>
							<Link
								to="/admin/dashboard/add-event"
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
							1,284
						</p>
						<p className="text-xs text-slate-500">
							+8.4% this month
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
							23
						</p>
						<p className="text-xs text-slate-500">
							Awaiting review
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
							78
						</p>
						<p className="text-xs text-slate-500">12 upcoming</p>
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
							5
						</p>
						<p className="text-xs text-slate-500">
							Needs attention
						</p>
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
		// 	</div>
		// </div>
	);
};
export default AdminDashboard;
