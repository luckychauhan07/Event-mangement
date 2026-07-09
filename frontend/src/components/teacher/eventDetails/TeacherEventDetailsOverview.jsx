const InfoCard = ({ label, value }) => (
	<div className="rounded-xl border border-slate-200 bg-white p-4">
		<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
			{label}
		</p>

		<p className="mt-2 text-sm font-medium text-slate-800">
			{value || "-"}
		</p>
	</div>
);

const TeacherEventDetailsOverview = ({ event }) => {
	return (
		<div className="space-y-6">

			{/* Description */}
			<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<h2 className="mb-4 text-xl font-semibold text-slate-800">
					Event Description
				</h2>

				<p className="leading-7 text-slate-600">
					{event.basic.description || "No description available."}
				</p>
			</div>

			{/* Event Details */}
			<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

				<InfoCard
					label="Category"
					value={event.basic.category}
				/>

				<InfoCard
					label="Event Type"
					value={event.basic.eventType}
				/>

				

				<InfoCard
					label="Venue"
					value={event.schedule.venue}
				/>

				<InfoCard
					label="Entry Fee"
					value={
						event.basic.entryFee
							? `₹${event.basic.entryFee}`
							: "Free"
					}
				/>

				<InfoCard
					label="Status"
					value={event.meta.status}
				/>

				<InfoCard
					label="Start"
					value={new Date(
						event.schedule.startAt
					).toLocaleString()}
				/>

				<InfoCard
					label="End"
					value={new Date(
						event.schedule.endAt
					).toLocaleString()}
				/>

				<InfoCard
					label="Created On"
					value={new Date(
						event.meta.createdAt
					).toLocaleDateString()}
				/>

			</div>

			{/* Statistics */}
			<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

				<div className="rounded-2xl bg-indigo-50 p-5 text-center">
					<p className="text-3xl font-bold text-indigo-700">
						{event.stats.totalRegistrations}
					</p>
					<p className="mt-2 text-sm text-slate-600">
						Registrations
					</p>
				</div>

				<div className="rounded-2xl bg-emerald-50 p-5 text-center">
	<p className="text-lg font-bold text-emerald-700">
		{event.registration.config.required ? "Open" : "Closed"}
	</p>

	<p className="mt-2 text-sm text-slate-600">
		Registration
	</p>
</div>

				<div className="rounded-2xl bg-sky-50 p-5 text-center">
	<p className="text-3xl font-bold text-sky-700">
		{Math.max((event.coordinators?.length || 1) - 1, 0)}
	</p>

	<p className="mt-2 text-sm text-slate-600">
		Other Teacher Coordinators
	</p>
</div>

				<div className="rounded-2xl bg-amber-50 p-5 text-center">
	<p className="text-xl font-bold capitalize text-amber-700">
		{event.schedule.mode}
	</p>

	<p className="mt-2 text-sm text-slate-600">
		Event Mode
	</p>
</div>

			</div>

		</div>
	);
};

export default TeacherEventDetailsOverview;