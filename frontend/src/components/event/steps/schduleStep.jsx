const ScheduleStep = ({ eventData, setEventData }) => {
	const update = (f, v) => setEventData({ ...eventData, [f]: v });

	return (
		<div className="grid grid-cols-2 gap-6">
			<input
				type="datetime-local"
				value={eventData.startAt || ""}
				onChange={(e) => update("startAt", e.target.value)}
			/>

			<input
				type="datetime-local"
				value={eventData.endAt || ""}
				onChange={(e) => update("endAt", e.target.value)}
			/>

			<select
				value={eventData.eventMode || ""}
				onChange={(e) => update("eventMode", e.target.value)}
			>
				<option value="">Select Mode</option>
				<option>Online</option>
				<option>Offline</option>
				<option>Hybrid</option>
			</select>

			<input placeholder="Venue" />

			<input placeholder="Rooms" />

			<input placeholder="Online Link" />

			<select>
				<option>No Recurrence</option>
				<option>Daily</option>
				<option>Weekly</option>
				<option>Monthly</option>
			</select>
		</div>
	);
};

export default ScheduleStep;
