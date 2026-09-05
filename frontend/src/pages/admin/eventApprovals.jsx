import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	ArrowUpRight,
	CheckCircle2,
	Clock3,
	MapPin,
	ShieldAlert,
	Tag,
	Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
	approveEventRequest,
	getPendingEventRequests,
	rejectEventRequest,
} from "../../services/eventServices";

const EventApprovals = () => {
	const navigate = useNavigate();
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState(null);
	const [selectedEvent, setSelectedEvent] = useState(null);
	const [rejectionReason, setRejectionReason] = useState("");

	const fetchPendingEvents = async () => {
		setLoading(true);
		try {
			const res = await getPendingEventRequests();
			setEvents(res?.events || []);
		} catch (error) {
			console.error(error);
			toast.error("Failed to load pending events");
			setEvents([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPendingEvents();
	}, []);

	const pendingCount = useMemo(() => events.length, [events]);

	const openRejectModal = (event) => {
		setSelectedEvent(event);
		setRejectionReason("");
	};

	const closeRejectModal = () => {
		if (processing?.action === "reject") return;
		setSelectedEvent(null);
		setRejectionReason("");
	};

	const handleApprove = async (eventId) => {
		if (processing?.id === eventId) return;

		setProcessing({ id: eventId, action: "approve" });
		try {
			const res = await approveEventRequest(eventId);
			toast.success(res?.message || "Event approved successfully");
			setEvents((prev) => prev.filter((event) => event.id !== eventId));
		} catch (error) {
			toast.error(
				error?.response?.data?.message || "Failed to approve event",
			);
		} finally {
			setProcessing(null);
		}
	};

	const handleReject = async () => {
		if (!selectedEvent) return;

		const reason = rejectionReason.trim();
		if (!reason) {
			toast.error("Please provide a rejection reason");
			return;
		}

		const eventId = selectedEvent.id;
		if (processing?.id === eventId) return;

		setProcessing({ id: eventId, action: "reject" });
		try {
			const res = await rejectEventRequest(eventId, reason);
			toast.success(res?.message || "Event rejected successfully");
			setEvents((prev) => prev.filter((event) => event.id !== eventId));
			closeRejectModal();
		} catch (error) {
			toast.error(
				error?.response?.data?.message || "Failed to reject event",
			);
		} finally {
			setProcessing(null);
		}
	};

	const formatDate = (value) => {
		if (!value) return "Not specified";
		const parsed = new Date(value);
		if (Number.isNaN(parsed.getTime())) return "Invalid date";
		return parsed.toLocaleString([], {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="min-h-full bg-slate-50 p-6 lg:p-8">
			<div className="mx-auto max-w-7xl space-y-6">
				<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
						<div>
							<div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
								<ShieldAlert size={14} />
								Teacher event approvals
							</div>
							<h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
								Review teacher event requests
							</h1>
							<p className="mt-2 max-w-2xl text-sm text-slate-600">
								Approve teacher-created event requests or reject
								them with a reason before they are published.
							</p>
						</div>

						<div className="flex flex-wrap gap-3">
							<button
								onClick={() => navigate(-1)}
								className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
							>
								<ArrowLeft size={16} />
								Back
							</button>
							<button
								onClick={() => navigate("/admin/events")}
								className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
							>
								<ArrowUpRight size={16} />
								All Events
							</button>
						</div>
					</div>

					<div className="mt-6 grid gap-4 sm:grid-cols-3">
						<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Pending Requests
							</p>
							<p className="mt-2 text-2xl font-bold text-slate-900">
								{pendingCount}
							</p>
						</div>
						<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Action Flow
							</p>
							<p className="mt-2 text-sm text-slate-700">
								Approve to publish, reject to keep it out of
								public listings.
							</p>
						</div>
						<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Review Status
							</p>
							<p className="mt-2 text-sm text-slate-700">
								Teacher events arrive as pending until you act on
								them.
							</p>
						</div>
					</div>
				</div>

				<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
					{loading ? (
						<div className="p-8 text-sm text-slate-500">
							Loading pending requests...
						</div>
					) : events.length === 0 ? (
						<div className="p-12 text-center">
							<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
								<Clock3 size={22} />
							</div>
							<h2 className="mt-4 text-xl font-semibold text-slate-900">
								No pending event requests
							</h2>
							<p className="mt-2 text-sm text-slate-500">
								Teacher-created events will appear here for
								approval.
							</p>
						</div>
					) : (
						<div className="divide-y divide-slate-100">
							{events.map((event) => {
								const isBusy = processing?.id === event.id;
								const startsAt = formatDate(
									event.start_at || event.startAt,
								);
								const endsAt = formatDate(
									event.end_at || event.endAt,
								);

								return (
									<div key={event.id} className="p-6">
										<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
											<div className="space-y-3">
												<div className="flex flex-wrap items-center gap-2">
													<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
														Pending Review
													</span>
													<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
														ID #{event.id}
													</span>
												</div>

												<h2 className="text-2xl font-bold tracking-tight text-slate-900">
													{event.title ||
														"Untitled Event"}
												</h2>
												<p className="max-w-3xl text-sm leading-6 text-slate-600">
													{event.description ||
														"No description provided."}
												</p>

												<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
													<InfoTile
														label="Category"
														value={
															event.category ||
															"-"
														}
														icon={<Tag size={14} />}
													/>
													<InfoTile
														label="Type"
														value={
															event.event_type ||
															event.eventType ||
															"-"
														}
														icon={
															<ShieldAlert
																size={14}
															/>
														}
													/>
													<InfoTile
														label="Organizer"
														value={
															event.organizer_unit ||
															event.organizerUnit ||
															"-"
														}
														icon={
															<MapPin size={14} />
														}
													/>
													<InfoTile
														label="Schedule"
														value={`${startsAt} • ${endsAt}`}
														icon={
															<Clock3 size={14} />
														}
													/>
												</div>
											</div>

											<div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
												<button
													type="button"
													disabled={isBusy}
													onClick={() =>
														navigate(
															`/admin/events/${event.id}`,
														)
													}
													className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
												>
													View Details
												</button>
												<button
													type="button"
													disabled={isBusy}
													onClick={() =>
														openRejectModal(event)
													}
													className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
												>
													<Trash2 size={15} />
													Reject
												</button>
												<button
													type="button"
													disabled={isBusy}
													onClick={() =>
														handleApprove(event.id)
													}
													className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
												>
													<CheckCircle2 size={15} />
													{processing?.action ===
														"approve" &&
													processing?.id === event.id
														? "Approving..."
														: "Approve"}
												</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>

			{selectedEvent && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
						<h3 className="text-2xl font-bold text-slate-900">
							Reject Event Request
						</h3>
						<p className="mt-2 text-sm text-slate-600">
							Provide a short reason for rejecting{" "}
							<span className="font-semibold text-slate-800">
								{selectedEvent.title || "this event"}
							</span>
							.
						</p>

						<label className="mt-5 block text-sm font-medium text-slate-700">
							Reason
						</label>
						<textarea
							rows={4}
							value={rejectionReason}
							onChange={(e) => setRejectionReason(e.target.value)}
							placeholder="Example: Missing event description or approval details."
							className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
						/>

						<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
							<button
								onClick={closeRejectModal}
								disabled={processing?.action === "reject"}
								className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
							>
								Cancel
							</button>
							<button
								onClick={handleReject}
								disabled={processing?.action === "reject"}
								className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
							>
								{processing?.action === "reject"
									? "Rejecting..."
									: "Confirm Reject"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

const InfoTile = ({ label, value, icon }) => (
	<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
		<div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
			{icon}
			{label}
		</div>
		<p className="mt-2 text-sm font-medium text-slate-800">{value}</p>
	</div>
);

export default EventApprovals;
