import { Card, CardContent, CardHeader } from "@/components/ui/card";

const EventDetailsOverview = ({ event }) => {
	const registrations = Number(event.stats?.totalRegistrations) || 0;
	const teams = Number(event.stats?.totalTeams) || 0;
	const limit = Number(event.registration?.config?.limit) || 0;
	const completion = limit
		? Math.min(100, Math.round((registrations / limit) * 100))
		: null;

	return (
		<>
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader>
						<h3 className="font-semibold">Event Summary</h3>
					</CardHeader>
					<CardContent className="space-y-4 text-sm">
						<div className="grid gap-3 sm:grid-cols-3">
							<div className="rounded-xl bg-blue-50 p-4">
								<p className="text-xs uppercase tracking-wide text-blue-600">
									Registrations
								</p>
								<p className="mt-1 text-2xl font-bold text-slate-900">
									{registrations}
								</p>
							</div>
							<div className="rounded-xl bg-violet-50 p-4">
								<p className="text-xs uppercase tracking-wide text-violet-600">
									Teams
								</p>
								<p className="mt-1 text-2xl font-bold text-slate-900">
									{teams}
								</p>
							</div>
							<div className="rounded-xl bg-emerald-50 p-4">
								<p className="text-xs uppercase tracking-wide text-emerald-600">
									Capacity
								</p>
								<p className="mt-1 text-2xl font-bold text-slate-900">
									{limit || "-"}
								</p>
							</div>
						</div>
						{completion !== null ? (
							<div>
								<div className="mb-2 flex justify-between text-xs text-slate-500">
									<span>Capacity used</span>
									<span>{completion}%</span>
								</div>
								<div className="h-2 overflow-hidden rounded-full bg-slate-100">
									<div
										className="h-full rounded-full bg-blue-600"
										style={{ width: `${completion}%` }}
									/>
								</div>
							</div>
						) : null}
						<div>
							<p className="text-xs uppercase tracking-wide text-slate-500">
								Description
							</p>
							<p className="mt-2 leading-6 text-slate-700">
								{event.basic?.description ||
									"No description provided."}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<h3 className="font-semibold">Schedule</h3>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						<p>
							<span className="text-slate-500">Category:</span>{" "}
							{event.basic?.category || "-"}
						</p>
						<p>
							<span className="text-slate-500">Event type:</span>{" "}
							{event.basic?.eventType || "-"}
						</p>
						<p>
							<span className="text-slate-500">Start:</span>{" "}
							{new Date(event.schedule.startAt).toLocaleString()}
						</p>
						<p>
							<span className="text-slate-500">End:</span>{" "}
							{new Date(event.schedule.endAt).toLocaleString()}
						</p>
						<p>
							<span className="text-slate-500">Mode:</span>{" "}
							{event.schedule.mode}
						</p>
						<p>
							<span className="text-slate-500">Venue:</span>{" "}
							{event.schedule.venue || "—"}
						</p>
						{event.schedule.onlineLink && (
							<a
								href={event.schedule.onlineLink}
								target="_blank"
								className="text-blue-600"
							>
								Join Link
							</a>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<h3 className="font-semibold">Meta</h3>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						<p>
							<span className="text-slate-500">Status:</span>{" "}
							{event.meta.status}
						</p>
						<p>
							<span className="text-slate-500">Created:</span>{" "}
							{new Date(event.meta.createdAt).toLocaleString()}
						</p>
					</CardContent>
				</Card>
			</div>
		</>
	);
};
export default EventDetailsOverview;
