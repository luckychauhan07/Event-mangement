const MediaStep = () => {
	return (
		<div className="grid grid-cols-2 gap-6">
			<input type="file" />

			<input placeholder="Promo Video Link" />

			<input type="file" multiple />

			<select>
				<option>Public</option>
				<option>Campus-only</option>
				<option>Department-only</option>
				<option>Private</option>
			</select>
		</div>
	);
};

export default MediaStep;
