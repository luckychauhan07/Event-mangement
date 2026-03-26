import {
	Sparkles,
	Calendar,
	Users,
	Hash,
	Tag,
	Clock,
	Eye,
	EyeOff,
	Trash2,
	Pencil,
	XCircle,
	UserPlus,
} from "lucide-react";

const EventSummary = ({ event }) => {
	const limit = event.registration.config.limit || 0;
	const filled = event.stats.totalRegistrations || 0;
	const pct = limit ? Math.round((filled / limit) * 100) : 0;

	const getEventPhase = () => {
		const now = new Date();
		const start = new Date(event.schedule.startAt);
		const end = new Date(event.schedule.endAt);
		if (now < start)
			return {
				label: "Upcoming",
				color: "text-violet-700 bg-violet-100 border-violet-200",
			};
		if (now > end)
			return {
				label: "Past",
				color: "text-slate-600 bg-slate-100 border-slate-200",
			};
		return {
			label: "Live Now",
			color: "text-emerald-700 bg-emerald-100 border-emerald-200",
		};
	};

	const phase = getEventPhase();

	const handleDelete = (id) => {
		if (window.confirm("Are you sure you want to delete this event?")) {
			// delete logic
		}
	};

	const fillColor =
		pct >= 90 ? "bg-rose-500" : pct >= 60 ? "bg-amber-500" : "bg-blue-500";

	return (
		<div className="min-h-screen bg-slate-50 p-6 font-sans">
			<div className="max-w-4xl mx-auto space-y-4">
				{/* HEADER CARD */}
				<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
					{/* Top accent bar */}
					<div className="h-1 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500" />

					<div className="p-8">
						{/* Phase badge + sparkle */}
						<div className="flex items-center gap-2 mb-5">
							<span
								className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${phase.color}`}
							>
								<span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
								{phase.label}
							</span>
							<Sparkles className="w-4 h-4 text-slate-300" />
						</div>

						{/* Title row */}
						<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
							<div className="flex-1 min-w-0">
								<h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none mb-2 truncate">
									{event.basic.title}
								</h1>
								{event.basic.subtitle && (
									<p className="text-base text-slate-500 font-medium mt-2">
										{event.basic.subtitle}
									</p>
								)}
								{event.basic.description && (
									<p className="text-sm text-slate-600 leading-relaxed mt-4 max-w-xl">
										{event.basic.description}
									</p>
								)}
							</div>

							{/* ACTION BUTTONS */}
							<div className="flex flex-col gap-3 shrink-0">
								<div className="flex items-center gap-2 flex-wrap lg:justify-end">
									<button
										onClick={() =>
											alert(
												"Edit event functionality coming soon!",
											)
										}
										className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
									>
										<Pencil className="w-3.5 h-3.5" />
										Edit
									</button>
									<button
										onClick={() =>
											handleDelete(event.basic.id)
										}
										className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-sm font-semibold transition-colors"
									>
										<Trash2 className="w-3.5 h-3.5" />
										Delete
									</button>
								</div>
								<div className="flex items-center gap-2 flex-wrap lg:justify-end">
									<button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-sm font-semibold transition-colors">
										<XCircle className="w-3.5 h-3.5" />
										Cancel
									</button>
									<button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold transition-colors">
										<EyeOff className="w-3.5 h-3.5" />
										Hide
									</button>
								</div>

								{/* Contextual hints */}
								<div className="space-y-1.5 lg:text-right">
									<p className="text-xs text-slate-400 leading-snug">
										<span className="font-medium text-slate-500">
											Hide
										</span>{" "}
										— invisible to participants
									</p>
									<p className="text-xs text-amber-600 leading-snug">
										<span className="font-medium">
											Cancel
										</span>{" "}
										— notifies all participants
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* META + COORDINATOR ROW */}
				<div className="flex flex-wrap gap-2 items-center">
					<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 shadow-sm">
						<Tag className="w-3.5 h-3.5 text-slate-400" />
						<span className="font-medium text-slate-400">
							Category
						</span>
						{event.basic.category}
					</span>
					<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 shadow-sm">
						<Hash className="w-3.5 h-3.5 text-slate-400" />
						<span className="font-medium text-slate-400">Type</span>
						{event.basic.eventType}
					</span>
					<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 shadow-sm">
						<Clock className="w-3.5 h-3.5 text-slate-400" />
						<span className="font-medium text-slate-400">
							Created
						</span>
						{new Date(event.meta.createdAt).toLocaleDateString(
							"en-US",
							{ month: "short", day: "numeric", year: "numeric" },
						)}
					</span>
					<button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors shadow-sm">
						<UserPlus className="w-3.5 h-3.5" />
						Assign Coordinator
					</button>
				</div>

				{/* STATS GRID */}
				<div className="grid grid-cols-3 gap-3">
					{[
						{
							label: "Registrations",
							value: filled,
							icon: Users,
							color: "text-blue-600",
							bg: "bg-blue-50",
						},
						{
							label: "Teams",
							value: event.stats.totalTeams,
							icon: Calendar,
							color: "text-violet-600",
							bg: "bg-violet-50",
						},
						{
							label: "Capacity",
							value: limit || "—",
							icon: Hash,
							color: "text-slate-600",
							bg: "bg-slate-50",
						},
					].map(({ label, value, icon: Icon, color, bg }) => (
						<div
							key={label}
							className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4"
						>
							<div
								className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}
							>
								<Icon className={`w-5 h-5 ${color}`} />
							</div>
							<div>
								<p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
									{label}
								</p>
								<p className="text-2xl font-black text-slate-900 leading-none mt-0.5">
									{value}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* CAPACITY PROGRESS */}
				{limit > 0 && (
					<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
						<div className="flex items-center justify-between mb-3">
							<p className="text-sm font-semibold text-slate-700">
								Registration Capacity
							</p>
							<span
								className={`text-sm font-bold tabular-nums ${pct >= 90 ? "text-rose-600" : pct >= 60 ? "text-amber-600" : "text-blue-600"}`}
							>
								{pct}%
							</span>
						</div>
						<div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
							<div
								className={`h-2.5 rounded-full transition-all duration-700 ${fillColor}`}
								style={{ width: `${Math.min(100, pct)}%` }}
							/>
						</div>
						<p className="text-xs text-slate-400 mt-2 tabular-nums">
							{filled} of {limit} spots filled
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default EventSummary;
