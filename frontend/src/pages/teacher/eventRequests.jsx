import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import toast from "react-hot-toast";
import { getTeacherEventRequests } from "../../services/eventServices";

const EventRequests = () => {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadRequests = async () => {
			try {
				const response = await getTeacherEventRequests();
				setEvents(response?.events || []);
			} catch (error) {
				console.error(error);
				toast.error("Failed to load event approval requests");
			} finally {
				setLoading(false);
			}
		};

		loadRequests();
	}, []);

	const pendingEvents = events.filter((event) => event.status === "pending");
	const rejectedEvents = events.filter((event) => event.status === "rejected");

	const formatDate = (value) =>
		value
			? new Date(value).toLocaleString([], {
					dateStyle: "medium",
					timeStyle: "short",
				})
			: "Not specified";

	const renderEvent = (event) => {
		const isRejected = event.status === "rejected";
		return (
			<div
				key={event.id}
				className={`rounded-2xl border p-5 ${
					isRejected
						? "border-rose-200 bg-rose-50/60"
						: "border-amber-200 bg-amber-50/60"
				}`}
			>
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<div className="flex items-center gap-2">
							{isRejected ? (
								<AlertCircle className="text-rose-600" size={18} />
							) : (
								<Clock3 className="text-amber-600" size={18} />
							)}
							<span className={`text-xs font-semibold uppercase tracking-wide ${isRejected ? "text-rose-700" : "text-amber-700"}`}>
								{isRejected ? "Rejected" : "Pending admin approval"}
							</span>
						</div>
						<h2 className="mt-2 text-xl font-semibold text-slate-900">
							{event.title || "Untitled event"}
						</h2>
						<p className="mt-1 text-sm text-slate-500">
							Created {formatDate(event.created_at)}
						</p>
					</div>
					<span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
						Event #{event.id}
					</span>
				</div>

				<p className="mt-4 text-sm leading-6 text-slate-600">
					{event.description || "No description provided."}
				</p>

				<div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
					<div>
						<span className="font-medium text-slate-800">Starts:</span>{" "}
						{formatDate(event.start_at)}
					</div>
					<div>
						<span className="font-medium text-slate-800">Category:</span>{" "}
						{event.category || "Not specified"}
					</div>
				</div>

				{isRejected && (
					<div className="mt-4 rounded-xl border border-rose-200 bg-white p-4">
						<p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
							Admin feedback
						</p>
						<p className="mt-1 text-sm text-slate-700">
							{event.rejection_reason || "No reason provided."}
						</p>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-slate-900">Event approval requests</h1>
				<p className="mt-1 text-sm text-slate-500">
					Track events waiting for review and read feedback on rejected requests.
				</p>
			</div>

			{loading ? (
				<div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
					Loading approval requests...
				</div>
			) : (
				<>
					<section className="space-y-3">
						<div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
							<Clock3 size={19} className="text-amber-600" />
							Pending review ({pendingEvents.length})
						</div>
						{pendingEvents.length ? (
							<div className="grid gap-4 lg:grid-cols-2">{pendingEvents.map(renderEvent)}</div>
						) : (
							<p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
								No events are waiting for admin approval.
							</p>
						)}
					</section>

					<section className="space-y-3">
						<div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
							<CheckCircle2 size={19} className="text-rose-600" />
							Rejected requests ({rejectedEvents.length})
						</div>
						{rejectedEvents.length ? (
							<div className="grid gap-4 lg:grid-cols-2">{rejectedEvents.map(renderEvent)}</div>
						) : (
							<p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
								No rejected event requests.
							</p>
						)}
					</section>
				</>
			)}
		</div>
	);
};

export default EventRequests;
