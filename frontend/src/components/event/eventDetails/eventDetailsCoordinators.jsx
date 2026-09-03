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
							event.formFields.map((f) => (
								<div
									key={f.id}
									className="rounded-xl border p-3"
								>
									<div className="flex items-center justify-between gap-3">
										<p className="font-semibold">
											{f.label}
										</p>
										<span
											className={`text-xs font-medium ${f.required ? "text-rose-600" : "text-slate-400"}`}
										>
											{f.required
												? "Required"
												: "Optional"}
										</span>
									</div>
									<p className="mt-1 text-xs capitalize text-slate-500">
										Type: {f.type}
									</p>
									{Array.isArray(f.options) &&
									f.options.length > 0 ? (
										<p className="mt-1 text-xs text-slate-500">
											Options: {f.options.join(", ")}
										</p>
									) : null}
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
