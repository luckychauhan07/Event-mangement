import { Sparkles } from "lucide-react";

const EventSummary = ({ event }) => {
	const limit = event.registration.config.limit || 0;
	const filled = event.stats.totalRegistrations || 0;
	const pct = limit ? Math.round((filled / limit) * 100) : 0;

	const getEventPhase = () => {
		const now = new Date();
		const start = new Date(event.schedule.startAt);
		const end = new Date(event.schedule.endAt);

		if (now < start) return "Upcoming";
		if (now > end) return "Past";
		return "Ongoing";
	};
	const Progress = ({ value = 0 }) => (
		<div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
			<div
				className="h-2 bg-blue-600"
				style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
			/>
		</div>
	);

	return (
		<div className="bg-gradient-to-br from-white via-blue-50 to-white rounded-xl shadow-lg p-8 border border-slate-200">
			<div className="flex items-start justify-between mb-6">
				{/* LEFT */}
				<div className="flex-1">
					<div className="flex items-center gap-3 mb-3">
						<Sparkles className="w-6 h-6 text-blue-600" />

						<span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
							{getEventPhase()}
						</span>
					</div>

					<h1 className="text-5xl font-bold text-slate-900 mb-2">
						{event.basic.title}
					</h1>

					{event.basic.subtitle && (
						<p className="text-lg text-slate-600 mb-4 font-medium">
							{event.basic.subtitle}
						</p>
					)}
				</div>

				{/* RIGHT ACTIONS */}
				<div className="flex gap-3">
					<button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
						Edit
					</button>
					<button className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
						Delete
					</button>
				</div>
			</div>

			{/* DESCRIPTION */}
			{event.basic.description && (
				<p className="text-slate-700 leading-relaxed mb-6 text-base">
					{event.basic.description}
				</p>
			)}

			{/* META CHIPS */}
			<div className="flex flex-wrap gap-3 mb-6">
				<div className="px-4 py-2 bg-white rounded-full text-sm text-slate-700 border border-slate-200 shadow-sm">
					<span className="font-semibold text-slate-600">
						Category:
					</span>{" "}
					{event.basic.category}
				</div>

				<div className="px-4 py-2 bg-white rounded-full text-sm text-slate-700 border border-slate-200 shadow-sm">
					<span className="font-semibold text-slate-600">Type:</span>{" "}
					{event.basic.eventType}
				</div>

				<div className="px-4 py-2 bg-white rounded-full text-sm text-slate-700 border border-slate-200 shadow-sm">
					<span className="font-semibold text-slate-600">
						Created:
					</span>{" "}
					{new Date(event.meta.createdAt).toLocaleDateString()}
				</div>
			</div>

			{/* STATS */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
				<div className="bg-white rounded-xl p-4 border shadow-sm">
					<p className="text-sm text-slate-500">Registrations</p>
					<p className="text-2xl font-bold text-slate-900">
						{filled}
					</p>
				</div>

				<div className="bg-white rounded-xl p-4 border shadow-sm">
					<p className="text-sm text-slate-500">Teams</p>
					<p className="text-2xl font-bold text-slate-900">
						{event.stats.totalTeams}
					</p>
				</div>

				<div className="bg-white rounded-xl p-4 border shadow-sm">
					<p className="text-sm text-slate-500">Limit</p>
					<p className="text-2xl font-bold text-slate-900">
						{limit || "N/A"}
					</p>
				</div>
				{/* <div className="bg-white rounded-xl p-4 border">
					<p className="text-xs text-slate-500">Fill Rate</p>
					<p className="text-xl font-bold">
						{limit ? `${pct}%` : "—"}
					</p>
				</div> */}
			</div>

			{/* PROGRESS BAR */}
			{limit > 0 && (
				<div>
					<div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
						<div
							className="h-2 bg-blue-600 transition-all"
							style={{ width: `${pct}%` }}
						/>
					</div>

					<p className="text-sm text-slate-600 mt-2">
						{filled} / {limit} filled ({pct}%)
					</p>
				</div>
			)}
		</div>
	);
};

export default EventSummary;
