const EventDetailsTabs = ({ activeTab, onTabChange }) => {
	return (
		<>
			<div className="flex gap-2 border-b">
				{[
					{ key: "overview", label: "Overview" },
					{ key: "registration", label: "Registration" },
					{ key: "team", label: "Team" },
					{ key: "people", label: "Coordinators & Fields" },
				].map((t) => (
					<button
						key={t.key}
						onClick={() => onTabChange(t.key)}
						className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${activeTab === t.key ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
					>
						{t.label}
					</button>
				))}
			</div>
		</>
	);
};
export default EventDetailsTabs;
