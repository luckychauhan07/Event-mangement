const TeacherEventDetailsRegistration = ({ event }) => {
	if (!event.registration.config.required) {
		return (
			<div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
				<h2 className="text-xl font-semibold text-slate-800">
					Registration Disabled
				</h2>

				<p className="mt-3 text-slate-500">
					This event does not allow participant registration.
				</p>
			</div>
		);
	}
	return (
		<div className="space-y-6">

			{/* Registration Summary */}
			<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

				<div className="rounded-2xl bg-emerald-50 p-5 text-center">
					<p className="text-xl font-bold text-emerald-700">
						{event.registration.config.required ? "Open" : "Closed"}
					</p>

					<p className="mt-2 text-sm text-slate-600">
						Registration
					</p>
				</div>

				<div className="rounded-2xl bg-indigo-50 p-5 text-center">
					<p className="text-xl font-bold capitalize text-indigo-700">
						{event.registration.config.type || "-"}
					</p>

					<p className="mt-2 text-sm text-slate-600">
						Registration Type
					</p>
				</div>

				<div className="rounded-2xl bg-sky-50 p-5 text-center">
					<p className="text-xl font-bold capitalize text-sky-700">
						{event.registration.config.participationType || "-"}
					</p>

					<p className="mt-2 text-sm text-slate-600">
						Participation
					</p>
				</div>

				<div className="rounded-2xl bg-amber-50 p-5 text-center">
					<p className="text-3xl font-bold text-amber-700">
						{event.stats.totalRegistrations}
					</p>

					<p className="mt-2 text-sm text-slate-600">
						Registrations
					</p>
				</div>

			</div>

			{/* Registration Details */}
			<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

	<h2 className="mb-6 text-xl font-semibold text-slate-800">
		Registration Details
	</h2>

	<div className="grid gap-6 md:grid-cols-2">

		<div>
			<p className="text-sm font-medium text-slate-500">
				Registration Starts
			</p>

			<p className="mt-1 font-semibold text-slate-800">
				{event.registration.config.start
					? new Date(
							event.registration.config.start
					  ).toLocaleString()
					: "-"}
			</p>
		</div>

		<div>
			<p className="text-sm font-medium text-slate-500">
				Registration Ends
			</p>

			<p className="mt-1 font-semibold text-slate-800">
				{event.registration.config.end
					? new Date(
							event.registration.config.end
					  ).toLocaleString()
					: "-"}
			</p>
		</div>

		<div>
			<p className="text-sm font-medium text-slate-500">
				Participation Type
			</p>

			<p className="mt-1 font-semibold capitalize text-slate-800">
				{event.registration.config.participationType || "-"}
			</p>
		</div>

		<div>
			<p className="text-sm font-medium text-slate-500">
				Registration Type
			</p>

			<p className="mt-1 font-semibold capitalize text-slate-800">
				{event.registration.config.type || "-"}
			</p>
		</div>

	</div>

</div>
					  {/*Team Details*/}
					  {event.registration?.config?.participationType === "team" &&
	event.team && (
		<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

		<h2 className="mb-6 text-xl font-semibold text-slate-800">
			Team Configuration
		</h2>

		<div className="grid gap-6 md:grid-cols-2">

			<div>
				<p className="text-sm text-slate-500">
					Minimum Team Size
				</p>

				<p className="mt-1 text-lg font-semibold">
					{event.team.min}
				</p>
			</div>

			<div>
				<p className="text-sm text-slate-500">
					Maximum Team Size
				</p>

				<p className="mt-1 text-lg font-semibold">
					{event.team.max}
				</p>
			</div>

		</div>

	</div>
)}

					{/*Preview of Registration Form*/}
					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
	<h2 className="mb-6 text-xl font-semibold text-slate-800">
		Registration Form Fields
	</h2>

	{event.formFields && event.formFields.length > 0 ? (
		<div className="space-y-4">
			{event.formFields.map((field) => (
				<div
					key={field.id}
					className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
				>
					<div>
						<p className="font-medium text-slate-800">
							{field.label}
						</p>

						<p className="mt-1 text-sm capitalize text-slate-500">
							Type: {field.type}
						</p>
					</div>

					<div className="flex gap-2">
						<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
							{field.type}
						</span>

						{field.required && (
							<span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
								Required
							</span>
						)}
					</div>
				</div>
			))}
		</div>
	) : (
		<p className="text-slate-500">
			No custom registration fields configured.
		</p>
	)}
</div>
		</div>
	);
};

export default TeacherEventDetailsRegistration;