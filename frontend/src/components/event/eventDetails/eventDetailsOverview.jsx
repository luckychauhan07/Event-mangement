import { Card, CardContent, CardHeader } from "@/components/ui/card";

const EventDetailsOverview = ({ event }) => {
	return (
		<>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<h3 className="font-semibold">Schedule</h3>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
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
