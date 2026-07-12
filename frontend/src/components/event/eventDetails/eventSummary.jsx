import { cancelEvent, deleteEvent } from "@/services/eventServices";
import {
	Sparkles,
	Calendar,
	Users,
	Hash,
	Tag,
	Clock,
	EyeOff,
	Trash2,
	Pencil,
	XCircle,
	UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { getEventStatusMeta } from "../../../utils/eventStatus";

const EventSummary = ({ event }) => {
	const navigate = useNavigate();
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [confirmText, setConfirmText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [isCanceling, setIsCanceling] = useState(false);
	const limit = event.registration.config.limit || 0;
	const filled = event.stats.totalRegistrations || 0;
	const pct = limit ? Math.round((filled / limit) * 100) : 0;

	const phase = getEventStatusMeta({
		status: event.meta.status,
		startAt: event.schedule.startAt,
		endAt: event.schedule.endAt,
	});

	const deleteKeyword = useMemo(() => {
		return `DELETE`;
	}, [event?.basic?.title]);

	const canDelete =
		confirmText.trim().toUpperCase() === deleteKeyword.toUpperCase();

	const handleDelete = async (id) => {
		if (!canDelete || isDeleting) return;
		try {
			setIsDeleting(true);
			await deleteEvent(id);
			toast.success("Event deleted successfully!");
			setTimeout(() => {
				navigate("/admin/events");
				setIsDeleting(false);
			}, 1000);
		} catch (error) {
			toast.error("Failed to delete event. Please try again.");
			setIsDeleting(false);
		}
	};
	const handleCancel = async (id) => {
		try {
			setIsCanceling(true);
			await cancelEvent(id);
			toast.success("Event cancelled successfully!");
			window.location.reload();
		} catch (error) {
			toast.error("Failed to cancel event. Please try again.");
			setIsCanceling(false);
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
					<div className="h-1 w-full bg-linear-to-r from-blue-500 via-violet-500 to-indigo-500" />

					<div className="p-8">
						{/* Phase badge + sparkle */}
						<div className="flex items-center gap-2 mb-5">
							<span
								className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${phase.badgeClass}`}
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
							{phase.label === "Upcoming" && (
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
												setIsDeleteOpen(true)
											}
											className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-sm font-semibold transition-colors"
										>
											<Trash2 className="w-3.5 h-3.5" />
											Delete
										</button>
									</div>
									<div className="flex items-center gap-2 flex-wrap lg:justify-end">
										<button
											className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
												isCanceling
													? "bg-amber-50 text-amber-300 border-amber-100 cursor-not-allowed"
													: "bg-linear-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-700 border-amber-200 shadow-sm"
											}`}
											onClick={() =>
												handleCancel(event.id)
											}
											disabled={isCanceling}
										>
											<XCircle className="w-3.5 h-3.5" />
											{isCanceling
												? "Canceling..."
												: "Cancel"}
										</button>
										{/* <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold transition-colors">
											<EyeOff className="w-3.5 h-3.5" />
											Hide
										</button> */}
									</div>

									{/* Contextual hints */}
									<div className="space-y-1.5 lg:text-right">
										{/* <p className="text-xs text-slate-400 leading-snug">
											<span className="font-medium text-slate-500">
												Hide
											</span>{" "}
											— invisible to participants
										</p> */}
										<p className="text-xs text-amber-600 leading-snug">
											<span className="font-medium">
												Cancel
											</span>{" "}
											— notifies all participants
										</p>
									</div>
								</div>
							)}
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
					{phase.label === "Upcoming" && (
						<button
							className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors shadow-sm"
							onClick={() =>
								navigate(
									`/admin/events/${event.id}/assign-coordinator`,
								)
							}
						>
							<UserPlus className="w-3.5 h-3.5" />
							Assign Coordinator
						</button>
					)}
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

			{/* DELETE CONFIRM CARD */}
			{isDeleteOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
						onClick={() => {
							if (isDeleting) return;
							setIsDeleteOpen(false);
							setConfirmText("");
						}}
					/>
					<div className="relative w-full max-w-lg bg-white rounded-2xl border border-rose-100 shadow-2xl overflow-hidden">
						<div className="h-1.5 w-full bg-linear-to-r from-rose-500 via-orange-500 to-amber-500" />
						<div className="p-6 space-y-4">
							<div className="flex items-start gap-3">
								<div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center">
									<Trash2 className="w-5 h-5 text-rose-600" />
								</div>
								<div>
									<h3 className="text-lg font-bold text-slate-900">
										Confirm delete
									</h3>
									<p className="text-sm text-slate-600 mt-1">
										This will permanently remove{" "}
										<span className="font-semibold text-slate-800">
											{event.basic.title}
										</span>{" "}
										and all its registrations.
									</p>
								</div>
							</div>

							<div className="bg-rose-50/60 border border-rose-100 rounded-xl p-4">
								<p className="text-xs font-semibold text-rose-700 uppercase tracking-wide">
									Type to confirm
								</p>
								<p className="text-xs text-slate-500 mt-1">
									Enter{" "}
									<span className="font-semibold text-slate-700">
										{deleteKeyword}
									</span>{" "}
									to enable deletion.
								</p>
								<input
									value={confirmText}
									onChange={(e) =>
										setConfirmText(e.target.value)
									}
									placeholder={deleteKeyword}
									className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
								/>
							</div>

							<div className="flex items-center justify-end gap-2">
								<button
									onClick={() => {
										if (isDeleting) return;
										setIsDeleteOpen(false);
										setConfirmText("");
									}}
									className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={() => handleDelete(event.id)}
									disabled={!canDelete || isDeleting}
									className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
										canDelete && !isDeleting
											? "bg-rose-600 hover:bg-rose-700 text-white border-rose-600"
											: "bg-rose-50 text-rose-300 border-rose-100 cursor-not-allowed"
									}`}
								>
									{isDeleting ? "Deleting..." : "Delete"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default EventSummary;
