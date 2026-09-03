import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { getAdminEvents } from "../../services/eventServices";
import DisplayEventList from "../../components/admin/displayEventList";
import { getEventTimelinePhase } from "../../utils/eventStatus";

const EventList = () => {
	const [allEvents, setAllEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [timeFilter, setTimeFilter] = useState("all");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [itemsPerPage, setItemsPerPage] = useState(12);
	const [currentPage, setCurrentPage] = useState(1);

	// ---------- Helpers ----------
	const getEventStartDate = (event) =>
		new Date(event.start_at || event.startAt || event.date || "");

	// ---------- Derived Data ----------
	const categoryOptions = useMemo(() => {
		return [
			...new Set(
				allEvents
					.map((e) => String(e.category || "").trim())
					.filter(Boolean),
			),
		].sort();
	}, [allEvents]);

	const stats = useMemo(() => {
		let upcoming = 0,
			ongoing = 0,
			past = 0;

		allEvents.forEach((event) => {
			const phase = getEventTimelinePhase(event);
			if (phase === "upcoming") upcoming++;
			else if (phase === "ongoing") ongoing++;
			else if (phase === "past") past++;
		});

		return { upcoming, ongoing, past };
	}, [allEvents]);

	const filteredEvents = useMemo(() => {
		return allEvents
			.filter((event) =>
				timeFilter === "all"
					? true
					: getEventTimelinePhase(event) === timeFilter,
			)
			.filter((event) =>
				categoryFilter === "all"
					? true
					: String(event.category || "").toLowerCase() ===
						categoryFilter.toLowerCase(),
			)
			.sort(
				(a, b) =>
					getEventStartDate(b).getTime() -
					getEventStartDate(a).getTime(),
			);
	}, [allEvents, timeFilter, categoryFilter]);

	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage)),
		[filteredEvents.length, itemsPerPage],
	);

	const paginatedEvents = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredEvents.slice(start, start + itemsPerPage);
	}, [filteredEvents, currentPage, itemsPerPage]);

	const visiblePages = useMemo(() => {
		const max = 5;
		let start = Math.max(1, currentPage - 2);
		let end = Math.min(totalPages, start + max - 1);

		if (end - start < max - 1) {
			start = Math.max(1, end - max + 1);
		}

		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}, [currentPage, totalPages]);

	// ---------- Effects ----------
	useEffect(() => {
		const fetchEvents = async () => {
			setLoading(true);
			try {
				const data = await getAdminEvents();
				setAllEvents(data?.events || []);
				console.log("Fetched events:", data?.events || []);
			} catch {
				setAllEvents([]);
			} finally {
				setLoading(false);
			}
		};
		fetchEvents();
	}, []);

	useEffect(() => {
		setCurrentPage(1);
	}, [timeFilter, categoryFilter, itemsPerPage]);

	useEffect(() => {
		setCurrentPage((p) => Math.min(p, totalPages));
	}, [totalPages]);

	const controlClass =
		"w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200";

	const navButtonClass =
		"inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

	// ---------- UI ----------
	return (
		<div className="space-y-5">
			{/* Header */}
			<div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
				<div className="flex items-center justify-between gap-3">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight text-slate-900">
							Event Management
						</h1>
						<p className="text-xs text-slate-500">
							Browse and manage all events
						</p>
					</div>
					<span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
						Total: {allEvents.length}
					</span>
				</div>
			</div>

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-4">
				{[
					{ label: "Total", value: allEvents.length },
					{ label: "Upcoming", value: stats.upcoming },
					{ label: "Ongoing", value: stats.ongoing },
					{ label: "Past", value: stats.past },
				].map((item) => (
					<div
						key={item.label}
						className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
					>
						<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
							{item.label}
						</p>
						<p className="mt-1 text-xl font-semibold text-slate-800">
							{item.value}
						</p>
					</div>
				))}
			</div>

			{/* Filters */}
			<div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
				<div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
					<SlidersHorizontal size={15} />
					Filters
				</div>

				<div className="grid gap-2 md:grid-cols-3">
					<select
						value={timeFilter}
						onChange={(e) => setTimeFilter(e.target.value)}
						className={controlClass}
					>
						<option value="all">All Time</option>
						<option value="upcoming">Upcoming</option>
						<option value="ongoing">Ongoing</option>
						<option value="past">Past</option>
					</select>

					<select
						value={categoryFilter}
						onChange={(e) => setCategoryFilter(e.target.value)}
						className={controlClass}
					>
						<option value="all">All Categories</option>
						{categoryOptions.map((c) => (
							<option key={c}>{c}</option>
						))}
					</select>

					<select
						value={itemsPerPage}
						onChange={(e) =>
							setItemsPerPage(Number(e.target.value))
						}
						className={controlClass}
					>
						<option value={12}>12 / page</option>
						<option value={24}>24 / page</option>
						<option value={48}>48 / page</option>
					</select>
				</div>
			</div>

			{/* List */}
			<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
				{loading ? (
					<p className="text-sm font-medium text-slate-500">
						Loading events...
					</p>
				) : (
					<DisplayEventList events={paginatedEvents} />
				)}
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
				<button
					onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
					disabled={currentPage === 1}
					className={navButtonClass}
				>
					<ChevronLeft size={16} /> Prev
				</button>

				<div className="flex items-center gap-1">
					<span className="mr-1 hidden text-xs text-slate-500 sm:inline">
						Page {currentPage} / {totalPages}
					</span>
					{visiblePages.map((p) => (
						<button
							key={p}
							onClick={() => setCurrentPage(p)}
							className={`h-8 min-w-8 rounded-lg px-2 text-sm font-medium transition-all ${
								p === currentPage
									? "bg-slate-900 text-white shadow-sm"
									: "border border-slate-200 text-slate-700 hover:bg-slate-50"
							}`}
						>
							{p}
						</button>
					))}
				</div>

				<button
					onClick={() =>
						setCurrentPage((p) => Math.min(totalPages, p + 1))
					}
					disabled={currentPage === totalPages}
					className={navButtonClass}
				>
					Next <ChevronRight size={16} />
				</button>
			</div>
		</div>
	);
};

export default EventList;
