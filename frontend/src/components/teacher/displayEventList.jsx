import {
	CalendarDays,
	Clock3,
	MapPin,
	Building2,
	Layers3,
	Shapes,
	ArrowUpRight,
	SquarePen,
	UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getEventStatusMeta } from "../../utils/eventStatus";

const DisplayEventList = ({ events, showAllEvents = false }) => {
	const formatDateTime = (value) => {
		if (!value) return "Not specified";

		const parsedDate = new Date(value);
		if (Number.isNaN(parsedDate.getTime())) return "Invalid date";

		return parsedDate.toLocaleString([], {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const navigate = useNavigate();

	const MetaChip = ({ icon: Icon, label, value }) => (
		<div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 transition-all duration-300 group-hover:border-slate-300 group-hover:bg-white">
			<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
				{label}
			</p>
			<div className="mt-1 flex items-center gap-2">
				<Icon size={14} className="text-slate-400" />
				<p className="text-sm font-medium text-slate-700">
					{value || "-"}
				</p>
			</div>
		</div>
	);

	if (!events.length) {
		return (
			<div className="rounded-2xl border border-dashed border-slate-300 bg-linear-to-br from-slate-50 to-white p-10 text-center">
				<h2 className="text-lg font-semibold text-slate-800">
					{showAllEvents ? "No active events" : "No events assigned"}
				</h2>
				<p className="mt-2 text-sm text-slate-500">
					{showAllEvents
						? "There are no upcoming or ongoing events available."
						: "There are no events assigned to you yet."}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-5">
			<div
				className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
					showAllEvents
						? "border-blue-200 bg-blue-50 text-blue-900"
						: "border-amber-200 bg-amber-50 text-amber-950"
				}`}
			>
				{showAllEvents ? (
					<CalendarDays
						className="mt-0.5 shrink-0 text-blue-600"
						size={18}
					/>
				) : (
					<UserCheck
						className="mt-0.5 shrink-0 text-amber-600"
						size={18}
					/>
				)}
				<div>
					<p className="text-sm font-semibold">
						{showAllEvents
							? "Browse active events"
							: "Your coordinator assignments"}
					</p>
					<p className="mt-0.5 text-xs opacity-75">
						{showAllEvents
							? "Upcoming and ongoing events across the platform."
							: "Events where you are responsible as coordinator. Past events remain available here."}
					</p>
				</div>
			</div>

			<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<h2 className="text-lg font-semibold text-slate-900">
					{showAllEvents ? "All Events" : "Assigned To You"}
				</h2>
				<span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
					{events.length} {showAllEvents ? "available" : "assigned"}
				</span>
			</div>

			<div className="grid gap-4 xl:grid-cols-2">
				{events.map((event) => {
					const status = getEventStatusMeta(event);
					const eventMode =
						event.event_mode || event.eventMode || "-";
					const eventType =
						event.event_type || event.eventType || "-";
					const startsAt =
						event.start_at || event.startAt || event.date || null;
					const endsAt = event.end_at || event.endAt || null;

					return (
						<div
							key={event.id}
							className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${status.borderClass}`}
						>
							<div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white via-slate-50/60 to-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

							<div className="relative flex items-start justify-between gap-3">
								<div className="space-y-2">
									<span
										className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.badgeClass}`}
									>
										<span
											className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`}
										/>
										{status.label}
									</span>
									<h3 className="text-base md:text-lg font-semibold text-slate-900 tracking-tight">
										{event.title || "Untitled Event"}
									</h3>
									<p className="text-sm text-slate-500 leading-6 max-h-12 overflow-hidden">
										{event.description ||
											"No description available"}
									</p>
								</div>

								<div className="flex items-center gap-2">
									{!showAllEvents &&
										status.label === "Upcoming" && (
											<button
												className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
												onClick={() =>
													navigate(
														`/teacher/events/${event.id}/edit`,
													)
												}
											>
												<SquarePen size={13} />
												Edit
											</button>
										)}
									<button
										className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-slate-800"
										onClick={() =>
											navigate(
												`/teacher/events/${event.id}`,
												{
													state: {
														from: showAllEvents
															? "/teacher/events/all"
															: "/teacher/events/assigned",
													},
												},
											)
										}
									>
										View Details
										<ArrowUpRight size={13} />
									</button>
								</div>
							</div>

							<div className="relative mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
								<MetaChip
									icon={Shapes}
									label="Category"
									value={event.category || "-"}
								/>
								<MetaChip
									icon={Layers3}
									label="Type"
									value={eventType}
								/>
								<MetaChip
									icon={CalendarDays}
									label="Mode"
									value={eventMode}
								/>
								<MetaChip
									icon={Building2}
									label="Organizer"
									value={
										event.organizer_unit ||
										event.organizerUnit ||
										"-"
									}
								/>
								<MetaChip
									icon={MapPin}
									label="Venue"
									value={
										event.venue || "Online / Not specified"
									}
								/>
								<MetaChip
									icon={Clock3}
									label="Starts"
									value={formatDateTime(startsAt)}
								/>
								<MetaChip
									icon={Clock3}
									label="Ends"
									value={formatDateTime(endsAt)}
								/>
							</div>
						</div>
					);
				})}
			</div>

			<div className="pt-2">
				<p className="text-xs text-slate-400">
					Showing {events.length}{" "}
					{showAllEvents ? "available" : "assigned"} event
					{events.length === 1 ? "" : "s"}
				</p>
			</div>
		</div>
	);
};
export default DisplayEventList;
