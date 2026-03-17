const RegistrationStep = () => {
	return (
		<div className="grid grid-cols-2 gap-6">
			<select>
				<option>Yes</option>
				<option>No</option>
			</select>

			<select>
				<option>Open</option>
				<option>Invite-only</option>
				<option>Approval-based</option>
			</select>

			<input type="datetime-local" />
			<input type="datetime-local" />

			<input placeholder="Participant Limit" />

			<select>
				<option>Low</option>
				<option>Medium</option>
				<option>High</option>
			</select>

			<input placeholder="Age Restriction" />
		</div>
	);
};

export default RegistrationStep;
