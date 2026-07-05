import { Link } from "react-router-dom";
import {
	CalendarPlus,
	Users,
	ClipboardCheck,
	Bell,
	ArrowUpRight,
	UserCheck,
} from "lucide-react";

const TeacherDashboard = () => {
	return (
		<main className="flex-1 p-6 lg:p-8">
			<div className="flex flex-col gap-6">
				{/* Header */}
				<div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur px-6 py-5 shadow-sm">
	<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
		<div>
			<h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
				Teacher Dashboard
			</h1>

			<p className="text-sm text-slate-500">
				Welcome back. Manage your events and activities.
			</p>
		</div>

		<div className="flex flex-wrap gap-3">
							<Link
								to="/teacher/events"
								className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
							>
								<CalendarPlus size={16} />
								My Events
							</Link>

							<Link
								to="/teacher/add-event"
								className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
							>
								<CalendarPlus size={16} />
								Create Event
							</Link>
						</div>
					</div>
				</div>

				{/* Stats */}
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
							12
						</p>

						<p className="text-xs text-slate-500">
							Total Events Created
						</p>
					</div>

					<div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex items-center justify-between">
							<div className="rounded-xl bg-blue-50 p-2 text-blue-600">
								<Bell size={18} />
							</div>

							<span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
								Upcoming
							</span>
						</div>

						<p className="mt-4 text-2xl font-semibold text-slate-900">
							5
						</p>

						<p className="text-xs text-slate-500">
							Upcoming Events
						</p>
					</div>

					<div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex items-center justify-between">
							<div className="rounded-xl bg-green-50 p-2 text-green-600">
								<ClipboardCheck size={18} />
							</div>

							<span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
								Completed
							</span>
						</div>

						<p className="mt-4 text-2xl font-semibold text-slate-900">
							7
						</p>

						<p className="text-xs text-slate-500">
							Completed Events
						</p>
					</div>

					<div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex items-center justify-between">
							<div className="rounded-xl bg-purple-50 p-2 text-purple-600">
								<UserCheck size={18} />
							</div>

							<span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
								Coordinators
							</span>
						</div>

						<p className="mt-4 text-2xl font-semibold text-slate-900">
							18
						</p>

						<p className="text-xs text-slate-500">
							Student Coordinators
						</p>
					</div>
				</div>

				{/* Quick Actions + Activity */}
				<div className="grid gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-slate-900">
								Quick Actions
							</h2>

							<span className="text-xs text-slate-400">
								Teacher Tools
							</span>
						</div>

						<div className="mt-4 grid gap-3 sm:grid-cols-2">
							<Link
								to="/teacher/add-event"
								className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
							>
								<span className="inline-flex items-center gap-2">
									<CalendarPlus size={16} />
									Create Event
								</span>

								<ArrowUpRight
									size={16}
									className="text-slate-400 transition group-hover:text-slate-700"
								/>
							</Link>

							<Link
								to="/teacher/events"
								className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
							>
								<span className="inline-flex items-center gap-2">
									<CalendarPlus size={16} />
									My Events
								</span>

								<ArrowUpRight
									size={16}
									className="text-slate-400 transition group-hover:text-slate-700"
								/>
							</Link>

							<Link
								to="/teacher/events"
								className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
							>
								<span className="inline-flex items-center gap-2">
									<Users size={16} />
									Assign Student Coordinators
								</span>

								<ArrowUpRight
									size={16}
									className="text-slate-400 transition group-hover:text-slate-700"
								/>
							</Link>

							<Link
								to="/teacher/events"
								className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
							>
								<span className="inline-flex items-center gap-2">
									<UserCheck size={16} />
									View Participants
								</span>

								<ArrowUpRight
									size={16}
									className="text-slate-400 transition group-hover:text-slate-700"
								/>
							</Link>
						</div>
					</div>

					{/* Recent Activity */}
					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-slate-900">
							Recent Activity
						</h2>

						<ul className="mt-4 space-y-3 text-sm text-slate-600">
							<li className="rounded-lg bg-slate-50 px-3 py-2">
								AI Workshop created successfully
							</li>

							<li className="rounded-lg bg-slate-50 px-3 py-2">
								Hackathon registrations opened
							</li>

							<li className="rounded-lg bg-slate-50 px-3 py-2">
								5 Student Coordinators assigned
							</li>

							<li className="rounded-lg bg-slate-50 px-3 py-2">
								Placement Drive updated
							</li>
						</ul>

						<p className="mt-4 text-xs text-slate-400">
							Last updated: Just now
						</p>
					</div>
				</div>
			</div>
		</main>
	);
};

export default TeacherDashboard;