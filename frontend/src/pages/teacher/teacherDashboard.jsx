import { Link } from "react-router-dom";
import {
	CalendarPlus,
	CalendarDays,
	ClipboardCheck,
	Bell,
	Users,
	UserCheck,
	ArrowUpRight,
	Pencil,	
} from "lucide-react";
import { useEffect, useState } from "react";
import { getTeacherDashboard } from "@/services/eventServices";

const TeacherDashboard = () => {
	const [loading, setLoading] = useState(true);
	const [dashboard, setDashboard] = useState(null);

	useEffect(() => {
		const loadDashboard = async () => {
			try {
				const data = await getTeacherDashboard();
				setDashboard(data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		loadDashboard();
	}, []);

	if (loading) {
		return (
			<main className="flex-1 flex items-center justify-center bg-slate-50">
				<div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
					<p className="text-lg font-medium text-slate-600">
						Loading dashboard...
					</p>
				</div>
			</main>
		);
	}

	const stats = dashboard?.stats || {};
	const events = dashboard?.events || [];

	return (
		<main className="flex-1 bg-slate-50 p-6 lg:p-8">
			<div className="mx-auto max-w-7xl space-y-8">

				{/* Hero */}
{/* Hero */}
<div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 px-8 py-6 text-white shadow-xl">

	<p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-200">
		Teacher Coordinator Portal
	</p>

	<h1 className="mt-2 text-3xl font-bold">
		Welcome Back 👋
	</h1>

	<p className="mt-3 max-w-3xl text-sm leading-7 text-indigo-100">
		Coordinate events, manage participants, oversee student coordinators,
		and keep every event organized from one unified dashboard.
	</p>

	<div className="mt-6 flex flex-wrap items-center gap-3">

		<span className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
			Event Management
		</span>

		<span className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
			Student Coordination
		</span>

		<span className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
			Registrations
		</span>

	</div>

</div>

				{/* Stats */}
				<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

					<StatCard
						title="Assigned Events"
						value={stats.assigned_events}
						description="Events under your coordination"
						icon={<CalendarDays size={20} />}
						color="bg-indigo-100 text-indigo-700"
					/>

					<StatCard
						title="Live Events"
						value={stats.active_events}
						description="Currently accepting activity"
						icon={<ClipboardCheck size={20} />}
						color="bg-emerald-100 text-emerald-700"
					/>

					<StatCard
						title="Registrations"
						value={stats.total_registrations}
						description="Total participants"
						icon={<Users size={20} />}
						color="bg-sky-100 text-sky-700"
					/>

					<StatCard
						title="Pending"
						value={stats.pending_approval}
						description="Awaiting approval"
						icon={<Bell size={20} />}
						color="bg-amber-100 text-amber-700"
					/>

				</div>

				{/* Quick Actions */}
				<div className="grid gap-5 md:grid-cols-2">

					<ActionCard
						icon={<Users size={22} />}
						title="Participants"
						link="/teacher/events"
					/>

					<ActionCard
						icon={<UserCheck size={22} />}
						title="Student Coordinators"
						link="/teacher/events"
					/>

				</div>

								{/* Events */}
				<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

					<div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

						<div>

							<h2 className="text-2xl font-bold text-slate-800">
								My Events
							</h2>

							<p className="mt-1 text-sm text-slate-500">
								Manage, edit and monitor all events assigned to you.
							</p>

						</div>

						<Link
							to="/teacher/add-event"
							className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
						>
							<CalendarPlus size={18} />
							Create Event
						</Link>

					</div>

					<div className="space-y-5">

						{events.length === 0 ? (

							<div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 py-20 text-center">

								<div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
									<CalendarDays
										size={30}
										className="text-indigo-600"
									/>
								</div>

								<h3 className="text-xl font-semibold text-slate-800">
									No Events Assigned
								</h3>

								<p className="mt-2 text-slate-500">
									You don't have any assigned events yet.
								</p>

							</div>

						) : (

							events.map((event) => {
	const progress = event.participant_limit
		? Math.round(
				(event.registrations / event.participant_limit) * 100
		  )
		: 0;

	return (
		<div
			key={event.id}
			className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition"
		>
			{/* Header */}
			<div className="flex justify-between items-start">
				<div>
					<h3 className="text-lg font-semibold text-slate-900">
						{event.title}
					</h3>

					<div className="flex gap-2 mt-2 flex-wrap">
						<span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
							{event.category}
						</span>

						<span
							className={`px-2 py-1 text-xs rounded-full ${
								event.status === "published"
									? "bg-green-100 text-green-700"
									: event.status === "draft"
									? "bg-gray-100 text-gray-700"
									: "bg-red-100 text-red-700"
							}`}
						>
							{event.status}
						</span>

						<span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
							{event.event_mode}
						</span>
					</div>
				</div>
			</div>

			{/* Dates */}
			<div className="mt-4 text-sm text-slate-600">
				<div>
					📅{" "}
					{new Date(event.start_at).toLocaleDateString("en-IN", {
						day: "numeric",
						month: "short",
						year: "numeric",
					})}
				</div>

				<div className="mt-1">
					🕒{" "}
					{new Date(event.start_at).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</div>
			</div>

			{/* Registration */}
			<div className="mt-5">
				<div className="flex justify-between text-sm">
					<span>Registrations</span>

					<span>
						{event.registrations}
						{event.participant_limit
							? ` / ${event.participant_limit}`
							: ""}
					</span>
				</div>

				<div className="w-full h-2 bg-slate-200 rounded-full mt-2">
					<div
						className="h-2 bg-blue-600 rounded-full"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>

			{/* Buttons */}
			<div className="flex gap-2 mt-5">
				<Link
    to={`/teacher/events/${event.id}`}
    className="rounded-xl border border-slate-300 bg-white px-5 py-2 font-medium text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition"
>
    View
</Link>

				<Link
    to={`/teacher/events/${event.id}/manage`}
    className="rounded-xl bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 transition"
>
    Manage
</Link>

				<Link
    to={`/teacher/events/${event.id}/edit`}
    className="rounded-xl border border-slate-300 bg-white px-5 py-2 font-medium text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition"
>
    Edit
</Link>
			</div>
		</div>
	);
})

						)}						

					</div>

				</div>

			</div>

		</main>
	);
};

function StatCard({ icon, title, value, description, color }) {
	return (
		<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

			<div className="flex items-center justify-between">

				<div
					className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}
				>
					{icon}
				</div>

				<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
					{title}
				</span>

			</div>

			<h3 className="mt-5 text-3xl font-bold text-slate-800">
				{value ?? 0}
			</h3>

			<p className="mt-1 text-sm text-slate-500">
				{description}
			</p>

		</div>
	);
}

function ActionCard({ icon, title, link }) {
	return (
		<Link
			to={link}
			className="group flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
		>

			<div className="flex items-center gap-4">

				<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white">
					{icon}
				</div>

				<div>

					<h3 className="text-base font-semibold text-slate-800">
						{title}
					</h3>

					<p className="mt-1 text-sm text-slate-500">
						View and manage
					</p>

				</div>

			</div>

			<ArrowUpRight
				size={20}
				className="text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-indigo-600"
			/>

		</Link>
	);
}

export default TeacherDashboard;