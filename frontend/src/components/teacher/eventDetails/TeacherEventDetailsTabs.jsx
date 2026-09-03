const TeacherEventDetailsTabs = ({
	activeTab,
	onTabChange,
	showParticipants,
}) => {
	const tabs = [
		{ key: "overview", label: "Overview" },
		{ key: "registration", label: "Registration" },
		...(showParticipants ? [{ key: "people", label: "Participants" }] : []),
	];

	return (
		<div className="flex gap-2 border-b">
			{tabs.map((tab) => (
				<button
					key={tab.key}
					onClick={() => onTabChange(tab.key)}
					className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
						activeTab === tab.key
							? "border-blue-600 text-blue-700"
							: "border-transparent text-slate-500 hover:text-slate-700"
					}`}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
};

export default TeacherEventDetailsTabs;
