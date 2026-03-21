import { Card, CardContent, CardHeader } from "@/components/ui/card";

const EventDetailsCoordinators = ({ event }) => {
	return (
		<>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<h3 className="font-semibold">Coordinators</h3>
					</CardHeader>
					<CardContent className="space-y-3">
						{event.coordinators.length === 0 ? (
							<div className="text-sm text-slate-500">
								No coordinators
							</div>
						) : (
							event.coordinators.map((c, i) => (
								<div key={i} className="p-3 border rounded-xl">
									<p className="font-semibold">{c.name}</p>
									<p className="text-sm text-slate-600">
										{c.email}
									</p>
									<p className="text-xs text-slate-500">
										{c.role}
									</p>
								</div>
							))
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<h3 className="font-semibold">Form Fields</h3>
					</CardHeader>
					<CardContent className="space-y-3">
						{event.formFields.length === 0 ? (
							<div className="text-sm text-slate-500">
								No custom fields
							</div>
						) : (
							event.formFields.map((f, i) => (
								<div key={i} className="p-3 border rounded-xl">
									<p className="font-semibold">{f.label}</p>
									<p className="text-xs text-slate-500">
										{f.type}
									</p>
								</div>
							))
						)}
					</CardContent>
				</Card>
			</div>
		</>
	);
};
export default EventDetailsCoordinators;
