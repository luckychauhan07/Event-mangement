import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
	ArrowRight,
	BadgeCheck,
	Bell,
	CalendarClock,
	CalendarDays,
	FileText,
	UserRound,
} from "lucide-react";
import { getAllEvents } from "../../services/eventServices";
import {
	formatDateTime,
	getCurrentUserProfile,
	getEventPhase,
	isRegisteredByUser,
	getRegistrationLabel,
} from "../../utils/userEventUtils";

const UserDashboard = () => {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const user = useMemo(() => getCurrentUserProfile(), []);
	const displayName =
		user?.full_name ||
		user?.name ||
		user?.username ||
		user?.email?.split("@")?.[0] ||
		"Guest";

	useEffect(() => {
		const loadUserOverview = async () => {
			setLoading(true);
			setError("");

			try {
				const data = await getAllEvents();
				setEvents(data?.events || []);
			} catch (err) {
				setEvents([]);
				setError(
					err?.response?.data?.message ||
						"Unable to load the user dashboard right now.",
				);
			} finally {
				setLoading(false);
			}
		};

		loadUserOverview();
	}, []);

	const availableEvents = useMemo(
		() => events.filter((event) => event.status !== "cancelled"),
		[events],
	);

	const registrations = useMemo(
    () => availableEvents.filter((event) => isRegisteredByUser(event)),
    [availableEvents],
);

	const nextEvent = useMemo(() => { // Find the single next upcoming event
		return (
			availableEvents
				.filter((event) => getEventPhase(event) === "upcoming")
				.sort(
					(a, b) =>
						new Date(a.start_at).getTime() -
						new Date(b.start_at).getTime(),
				)[0] || null
		);
	}, [availableEvents]);

	const stats = useMemo(
		() => ({
			totalEvents: availableEvents.length,
			registered: registrations.filter((event) =>
				isRegisteredByUser(event) && getRegistrationLabel(event) === "Confirmed",
			).length,
			pending: registrations.filter((event) =>
				isRegisteredByUser(event) && getRegistrationLabel(event) === "Pending Approval",
			).length,
		}),
		[availableEvents, registrations],
	);

	const upcomingPreview = useMemo(
		() =>
			availableEvents
				.filter((event) => getEventPhase(event) === "upcoming")
				.sort(
					(a, b) =>
						new Date(a.start_at).getTime() -
						new Date(b.start_at).getTime(),
				)
				.slice(0, 3),
		[availableEvents],
	);

	return (
		<div className="space-y-6">
			<section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
					<div className="space-y-3">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-500">
								User Dashboard
							</p>
							<h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
								Welcome, {displayName}
							</h1>
							<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
								Discover upcoming events, manage your registrations,
								and keep your profile ready for participation.
								</p>								
						</div>

						<div className="flex flex-wrap gap-3">
							<Link
								to="/user/events"
								className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
							>
								Browse Events
								<ArrowRight size={16} />
							</Link>
							<Link
								to="/user/registrations"
								className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
							>
								My Registrations
							</Link>
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-3 lg:w-[440px]">
						<div className="rounded-2xl bg-slate-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Total Events
							</p>
							<p className="mt-3 text-3xl font-bold text-slate-900">
								{stats.totalEvents}
							</p>
						</div>
						<div className="rounded-2xl bg-emerald-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
								Registered
							</p>
							<p className="mt-3 text-3xl font-bold text-emerald-800">
								{stats.registered}
							</p>
						</div>
						<div className="rounded-2xl bg-amber-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
								Pending
							</p>
							<p className="mt-3 text-3xl font-bold text-amber-800">
								{stats.pending}
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="overflow-hidden rounded-[2rem] bg-linear-to-r from-blue-700 via-indigo-700 to-violet-700 p-6 text-white shadow-lg">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-2xl">
						<p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
							Next Event
						</p>
						{nextEvent ? (
							<>
								<h2 className="mt-4 text-2xl font-semibold">
									{nextEvent.title}
								</h2>
								<p className="mt-2 text-sm text-blue-100">
									{formatDateTime(nextEvent.start_at)} ·{" "}
									{nextEvent.venue || "Venue to be announced"}
								</p>
								<p className="mt-3 max-w-xl text-sm leading-6 text-blue-50">
									{nextEvent.description ||
										"Explore the next upcoming event and review the registration details before joining."}
								</p>
							</>
						) : (
							<>
								<h2 className="mt-4 text-2xl font-semibold">
									No upcoming event yet
								</h2>
								<p className="mt-2 text-sm text-blue-100">
									New events will appear here as soon as they are
									available for users.
								</p>
							</>
						)}
					</div>

					<div className="flex flex-wrap gap-3">
						{nextEvent ? (
							<Link
								to={`/user/events/${nextEvent.id}`}
								className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
							>
								View Details
							</Link>
						) : null}
						<Link
							to="/user/events"
							className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
						>
							Explore Events
						</Link>
					</div>
				</div>
			</section>

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Link
					to="/user/events"
					className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
				>
					<CalendarDays className="text-blue-600" size={26} />
					<h3 className="mt-4 text-lg font-semibold text-slate-900">
						Browse Events
					</h3>
					<p className="mt-2 text-sm leading-6 text-slate-600">
						See all upcoming events and open the full event details page.
					</p>
				</Link>

				<Link
					to="/user/registrations"
					className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
				>
					<FileText className="text-emerald-600" size={26} />
					<h3 className="mt-4 text-lg font-semibold text-slate-900">
						My Registrations
					</h3>
					<p className="mt-2 text-sm leading-6 text-slate-600">
						Track approved and pending registrations from one place.
					</p>
				</Link>

				<Link
					to="/user/notifications"
					className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
				>
					<Bell className="text-amber-500" size={26} />
					<h3 className="mt-4 text-lg font-semibold text-slate-900">
						Notifications
					</h3>
					<p className="mt-2 text-sm leading-6 text-slate-600">
						Check announcements and updates when admin or teachers send them.
					</p>
				</Link>

				<Link
					to="/user/profile"
					className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
				>
					<UserRound className="text-violet-600" size={26} />
					<h3 className="mt-4 text-lg font-semibold text-slate-900">
						My Profile
					</h3>
					<p className="mt-2 text-sm leading-6 text-slate-600">
						Review your student information and participation summary.
					</p>
				</Link>
			</section>

			<section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
				<div className="mb-4 flex items-center justify-between">
					<div>
						<h2 className="text-xl font-semibold text-slate-900">
							Upcoming Preview
						</h2>
						<p className="text-sm text-slate-500">
							A quick look at the next user-facing events.
						</p>
					</div>
					<Link
						to="/user/events"
						className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
					>
						View all
					</Link>
				</div>

				{loading ? (
					<p className="text-sm text-slate-500">Loading dashboard data...</p>
				) : error ? (
					<div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
						{error}
					</div>
				) : upcomingPreview.length === 0 ? (
					<div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
						No upcoming events are available at the moment.
					</div>
				) : (
					<div className="grid gap-4 lg:grid-cols-3">
						{upcomingPreview.map((event) => (
							<div
								key={event.id}
								className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
							>
								<div className="flex items-center justify-between gap-3">
									<span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
										{event.category || "General"}
									</span>
									{isRegisteredByUser(event) && getRegistrationLabel(event) === "Pending Approval" ? (
										<span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
											<CalendarClock size={12} />
											Pending
										</span>
									) : isRegisteredByUser(event) && getRegistrationLabel(event) === "Confirmed" ? (
										<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
											<BadgeCheck size={12} /> {/* Using BadgeCheck for confirmed */}
											Registered
										</span>
									) : null}
								</div>

								<h3 className="mt-4 text-lg font-semibold text-slate-900">
									{event.title}
								</h3>
								<p className="mt-2 text-sm text-slate-600">
									{formatDateTime(event.start_at)}
								</p>
								<p className="mt-1 text-sm text-slate-500">
									{event.venue || "Venue to be announced"}
								</p>

								<Link
									to={`/user/events/${event.id}`}
									className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
								>
									Open Details
									<ArrowRight size={14} />
								</Link>
							</div>
						))}
					</div>
				)}
			</section>
		</div>
	);
};

export default UserDashboard;
