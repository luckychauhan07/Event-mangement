const AudienceStep = () => {
	return (
		<div>
			<label>Audience Role</label>

			<div className="flex gap-4">
				<label>
					<input type="checkbox" />
					Students
				</label>
				<label>
					<input type="checkbox" />
					Faculty
				</label>
				<label>
					<input type="checkbox" />
					Staff
				</label>
				<label>
					<input type="checkbox" />
					External
				</label>
			</div>
		</div>
	);
};

export default AudienceStep;
