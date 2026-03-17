const ResourcesStep = () => {
	return (
		<div className="grid grid-cols-2 gap-6">
			<select>
				<option>No</option>
				<option>Yes</option>
			</select>

			<input placeholder="Accommodation Details" />

			<input placeholder="Equipment Needed" />

			<select>
				<option>No</option>
				<option>Yes</option>
			</select>

			<input placeholder="Catering Details" />

			<select>
				<option>No</option>
				<option>Yes</option>
			</select>
		</div>
	);
};

export default ResourcesStep;
