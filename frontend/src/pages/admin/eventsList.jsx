import { useEffect, useState } from "react";
import { getAllEvents } from "../../services/eventServices";
import DisplayEventList from "../../components/admin/displayEventList";

const EventList = () => {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);

	const getEventStartDate = (event) =>
		new Date(event.start_at || event.startAt || event.date || "");

	const upcomingEventsCount = events.filter((event) => {
		const startDate = getEventStartDate(event);
		return !Number.isNaN(startDate.getTime()) && startDate > new Date();
	}).length;

	const pastEventsCount = events.filter((event) => {
		const startDate = getEventStartDate(event);
		return !Number.isNaN(startDate.getTime()) && startDate <= new Date();
	}).length;

	useEffect(() => {
		const fetchEvents = async () => {
			setLoading(true);

			try {
				const data = await getAllEvents();
				console.log("Fetched events:", data);
				setEvents(data?.events || []);
			} catch (err) {
				console.error(err);
				setEvents([]);
			} finally {
				setLoading(false);
			}
		};

		fetchEvents();
	}, []);

	return (
		<div className="space-y-6">
			<div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur px-6 py-5 shadow-sm">
				<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
							Events
						</h1>
						<p className="text-sm text-slate-500 mt-1">
							View and manage all created events
						</p>
					</div>
				</div>
			</div>

			{loading ? (
				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<p className="text-sm text-slate-500">Loading events...</p>
				</div>
			) : (
				<>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
								Total Events
							</p>
							<p className="mt-3 text-2xl font-semibold text-slate-900">
								{events.length}
							</p>
						</div>
						<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
								Upcoming
							</p>
							<p className="mt-3 text-2xl font-semibold text-emerald-600">
								{upcomingEventsCount}
							</p>
						</div>
						<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
								Past / Ongoing
							</p>
							<p className="mt-3 text-2xl font-semibold text-slate-700">
								{pastEventsCount}
							</p>
						</div>
					</div>

					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
						<DisplayEventList events={events} />
					</div>
				</>
			)}
		</div>
	);
};
export default EventList;
