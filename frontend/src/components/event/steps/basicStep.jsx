const BasicStep = ({ eventData, setEventData }) => {
	const update = (field, value) => {
		console.log(field, value);
		setEventData({ ...eventData, [field]: value });
	};

	return (
		<div className="grid grid-cols-2 gap-6">
			<div className="col-span-2">
				<label>Event Title</label>

				<input
					className="border p-2 rounded w-full"
					value={eventData.title || ""}
					onChange={(e) => update("title", e.target.value)}
				/>
			</div>

			<div className="col-span-2">
				<label>Subtitle</label>

				<input
					className="border p-2 rounded w-full"
					value={eventData.subtitle || ""}
					onChange={(e) => update("subtitle", e.target.value)}
				/>
			</div>

			<div className="col-span-2">
				<label>Description</label>

				<textarea
					className="border p-2 rounded w-full"
					value={eventData.description || ""}
					onChange={(e) => update("description", e.target.value)}
				/>
			</div>

			<div>
				<label>Category</label>

				<select
					className="border p-2 rounded w-full"
					value={eventData.category || ""}
					onChange={(e) => update("category", e.target.value)}
				>
					<option value="" disabled>
						Select
					</option>
					<option>Technical</option>
					<option>Cultural</option>
					<option>Sports</option>
					<option>Workshop</option>
					<option>Talk</option>
					<option>Competition</option>
					<option>Festival</option>
				</select>
			</div>

			<div>
				<label>Event Type</label>

				<select
					className="border p-2 rounded w-full"
					value={eventData.eventType || ""}
					onChange={(e) => update("eventType", e.target.value)}
				>
					<option value="" disabled>
						Select
					</option>
					<option value="free">Free Entry</option>
					<option value="paid">Paid Entry</option>
				</select>
			</div>

			{eventData.eventType === "paid" && (
				<div>
					<label>Entry Fee</label>

					<input
						type="number"
						className="border p-2 rounded w-full"
						value={eventData.entryFee || ""}
						onChange={(e) => update("entryFee", e.target.value)}
					/>
				</div>
			)}

			<div className="col-span-2">
				<label>Tags</label>

				<input
					className="border p-2 rounded w-full"
					placeholder="AI, Hackathon, Coding"
					value={eventData.tags || ""}
					onChange={(e) => update("tags", e.target.value)}
				/>
			</div>
		</div>
	);
};

export default BasicStep;
