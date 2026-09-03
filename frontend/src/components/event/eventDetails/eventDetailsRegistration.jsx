import { Card, CardContent, CardHeader } from "@/components/ui/card";

const EventDetailsRegistration = ({ event }) => {
	return (
		<>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<h3 className="font-semibold">Config</h3>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						<p>
							<span className="text-slate-500">Required:</span>{" "}
							{event.registration.config.required ? "Yes" : "No"}
						</p>
						<p>
							<span className="text-slate-500">Type:</span>{" "}
							{event.registration.config.type || "—"}
						</p>
						<p>
							<span className="text-slate-500">Start:</span>{" "}
							{event.registration.config.start
								? new Date(
										event.registration.config.start,
									).toLocaleString()
								: "—"}
						</p>
						<p>
							<span className="text-slate-500">End:</span>{" "}
							{event.registration.config.end
								? new Date(
										event.registration.config.end,
									).toLocaleString()
								: "—"}
						</p>
						<p>
							<span className="text-slate-500">Limit:</span>{" "}
							{event.registration.config.limit || "—"}
						</p>
						<p>
							<span className="text-slate-500">
								Current registrations:
							</span>{" "}
							{event.stats?.totalRegistrations || 0}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<h3 className="font-semibold">Rules</h3>
					</CardHeader>
					<CardContent>
						{event.registration.rules.length === 0 ? (
							<div className="text-sm text-slate-500">
								No rules configured
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead className="text-slate-600 border-b">
										<tr>
											<th className="text-left py-2">
												Allow
											</th>
											<th className="text-left py-2">
												Type
											</th>
											<th className="text-left py-2">
												Participation
											</th>
											<th className="text-left py-2">
												Team
											</th>
											<th className="text-left py-2">
												Limit
											</th>
											<th className="text-left py-2">
												Start
											</th>
											<th className="text-left py-2">
												End
											</th>
										</tr>
									</thead>
									<tbody>
										{event.registration.rules.map(
											(r, i) => (
												<tr
													key={i}
													className="border-b"
												>
													<td className="py-2">
														{r.allow ? "Yes" : "No"}
													</td>
													<td>{r.type || "—"}</td>
													<td>
														{r.participation || "—"}
													</td>
													<td>
														{r.teamMin || r.teamMax
															? `${r.teamMin || "—"} - ${r.teamMax || "—"}`
															: "—"}
													</td>
													<td>{r.limit || "—"}</td>
													<td>
														{r.start
															? new Date(
																	r.start,
																).toLocaleString()
															: "—"}
													</td>
													<td>
														{r.end
															? new Date(
																	r.end,
																).toLocaleString()
															: "—"}
													</td>
												</tr>
											),
										)}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</>
	);
};
export default EventDetailsRegistration;
