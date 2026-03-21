import { Card, CardContent, CardHeader } from "@/components/ui/card";

const EventDetailsTeam = ({ event }) => {
	return (
		<>
			<Card>
				<CardHeader>
					<h3 className="font-semibold">Team Configuration</h3>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					<p>
						<span className="text-slate-500">Enabled:</span>{" "}
						{event.team.enabled ? "Yes" : "No"}
					</p>
					<p>
						<span className="text-slate-500">Min:</span>{" "}
						{event.team.min || "—"}
					</p>
					<p>
						<span className="text-slate-500">Max:</span>{" "}
						{event.team.max || "—"}
					</p>
					<p>
						<span className="text-slate-500">Join Mode:</span>{" "}
						{event.team.joinMode || "—"}
					</p>
				</CardContent>
			</Card>
		</>
	);
};
export default EventDetailsTeam;
