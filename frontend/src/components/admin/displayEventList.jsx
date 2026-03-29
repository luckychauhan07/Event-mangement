import {
	CalendarDays,
	Clock3,
	MapPin,
	Building2,
	Layers3,
	Shapes,
	ArrowUpRight,
	SquarePen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DisplayEventList = ({ events }) => {
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
	const getEventStatus = (event) => {
		const now = new Date();
		const startDate = new Date(event.start_at || event.startAt || "");
		const endDate = new Date(event.end_at || event.endAt || "");
		if (event.status === "cancelled") {
			return {
				label: "Cancelled",
				badgeClass: "bg-red-100 text-red-700 border border-red-200",
				borderClass: "border-red-200/80",
				dotClass: "bg-red-500",
			};
		}

		if (Number.isNaN(startDate.getTime())) {
			return {
				label: "Unknown",
				badgeClass:
					"bg-slate-100 text-slate-700 border border-slate-200",
				borderClass: "border-slate-200",
				dotClass: "bg-slate-500",
			};
		}

		if (
			!Number.isNaN(endDate.getTime()) &&
			now >= startDate &&
			now <= endDate
		) {
			return {
				label: "Ongoing",
				badgeClass: "bg-blue-100 text-blue-700 border border-blue-200",
				borderClass: "border-blue-200/70",
				dotClass: "bg-blue-500",
			};
		}

		if (now < startDate) {
			return {
				label: "Upcoming",
				badgeClass:
					"bg-emerald-100 text-emerald-700 border border-emerald-200",
				borderClass: "border-emerald-200/80",
				dotClass: "bg-emerald-500",
			};
		}

		return {
			label: "Past",
			badgeClass: "bg-slate-100 text-slate-700 border border-slate-200",
			borderClass: "border-slate-200",
			dotClass: "bg-slate-500",
		};
	};

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
					No events found
				</h2>
				<p className="mt-2 text-sm text-slate-500">
					Create a new event to see it here.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-5">
			<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<h2 className="text-lg font-semibold text-slate-900">
					All Events
				</h2>
				<span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
					{events.length} total
				</span>
			</div>

			<div className="grid gap-4 xl:grid-cols-2">
				{events.map((event) => {
					const status = getEventStatus(event);
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
									{status.label === "Upcoming" && (
										<button
											className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
											onClick={() => {
												console.log(
													"Edit event with ID:",
													event.id,
												);
												navigate(
													`/admin/events/${event.id}/edit`,
												);
											}}
										>
											<SquarePen size={13} />
											Edit
										</button>
									)}
									<button
										className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-slate-800"
										onClick={() =>
											navigate(
												`/admin/events/${event.id}`,
											)
										}
									>
										View
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
					Showing {events.length} event
					{events.length === 1 ? "" : "s"}
				</p>
			</div>
		</div>
	);
};
export default DisplayEventList;
