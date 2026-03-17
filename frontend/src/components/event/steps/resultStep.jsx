const ResultStep = () => {
	return (
		<div className="grid grid-cols-2 gap-6">
			<select>
				<option>No</option>
				<option>Yes</option>
			</select>

			<select>
				<option>Position</option>
				<option>Score</option>
				<option>Both</option>
			</select>

			<input placeholder="Positions Count" />

			<input placeholder="Total Marks" />

			<input placeholder="Evaluation Criteria" />

			<input placeholder="Judges Count" />
		</div>
	);
};

export default ResultStep;
