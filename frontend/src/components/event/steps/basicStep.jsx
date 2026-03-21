import { Calendar, Tag, FileText, DollarSign } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";

const BasicStep = forwardRef(({ eventData, setEventData }, ref) => {
	const isBlank = (value) => !value || !String(value).trim();
	const isPositiveNumber = (value) => {
		if (value === undefined || value === null || value === "") {
			return false;
		}

		const parsedValue = Number(value);
		return Number.isFinite(parsedValue) && parsedValue > 0;
	};

	const update = (field, value) => {
		console.log(field, value);
		setEventData({ ...eventData, [field]: value });
		console.log("Updated event data:", { ...eventData, [field]: value });
	};
	const handleTags = (value) => {
		const tagsArray = value.split(",").map((tag) => tag.trim());
		console.log("Tags array:", tagsArray);
		setEventData({ ...eventData, tags: tagsArray });
	};
	useImperativeHandle(ref, () => ({
		validate() {
			if (isBlank(eventData.title)) {
				return "Event title is required";
			}
			if (isBlank(eventData.description)) {
				return "Event description is required";
			}
			if (isBlank(eventData.category)) {
				return "Event category is required";
			}
			if (isBlank(eventData.eventType)) {
				return "Event type is required";
			}
			if (
				eventData.eventType === "paid" &&
				!isPositiveNumber(eventData.entryFee)
			) {
				return "Entry fee must be greater than 0 for paid events";
			}
			return true;
		},
	}));
	const inputStyle =
		"w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white";

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3 pb-4 border-b border-slate-100">
				<div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
					<Calendar size={20} />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900">
						Basic Information
					</h3>
					<p className="text-sm text-slate-500">
						Enter the fundamental details of your event
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				<div className="md:col-span-2">
					<label className="block text-sm font-medium text-slate-700 mb-1.5">
						Event Title <span className="text-red-500">*</span>
					</label>
					<div className="relative">
						<Tag
							className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							size={18}
						/>
						<input
							className={`${inputStyle} pl-10`}
							placeholder="e.g. Hackathon 2026"
							value={eventData.title || ""}
							onChange={(e) => update("title", e.target.value)}
						/>
					</div>
				</div>

				<div className="md:col-span-2">
					<label className="block text-sm font-medium text-slate-700 mb-1.5">
						Subtitle
					</label>
					<input
						className={inputStyle}
						placeholder="Optional tagline for your event"
						value={eventData.subtitle || ""}
						onChange={(e) => update("subtitle", e.target.value)}
					/>
				</div>

				<div className="md:col-span-2">
					<label className="block text-sm font-medium text-slate-700 mb-1.5">
						Description <span className="text-red-500">*</span>
					</label>
					<div className="relative">
						<FileText
							className="absolute left-3 top-3 text-slate-400"
							size={18}
						/>
						<textarea
							className={`${inputStyle} pl-10 resize-none`}
							rows={4}
							placeholder="Describe your event in detail..."
							value={eventData.description || ""}
							onChange={(e) =>
								update("description", e.target.value)
							}
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-slate-700 mb-1.5">
						Category <span className="text-red-500">*</span>
					</label>
					<select
						className={inputStyle}
						value={eventData.category || ""}
						onChange={(e) => update("category", e.target.value)}
						required
					>
						<option value="" disabled>
							Select Category
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
					<label className="block text-sm font-medium text-slate-700 mb-1.5">
						Event Type <span className="text-red-500">*</span>
					</label>
					<select
						className={inputStyle}
						value={eventData.eventType || ""}
						onChange={(e) => update("eventType", e.target.value)}
					>
						<option value="" disabled>
							Select Type
						</option>
						<option value="free">Free Entry</option>
						<option value="paid">Paid Entry</option>
					</select>
				</div>

				{eventData.eventType === "paid" && (
					<div className="animate-in fade-in slide-in-from-top-2 duration-300">
						<label className="block text-sm font-medium text-slate-700 mb-1.5">
							Entry Fee (₹){" "}
							<span className="text-red-500">*</span>
						</label>
						<div className="relative">
							<DollarSign
								className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
								size={18}
							/>
							<input
								type="number"
								min="1"
								step="1"
								className={`${inputStyle} pl-10`}
								placeholder="e.g. 500"
								value={eventData.entryFee || ""}
								onChange={(e) =>
									update("entryFee", e.target.value)
								}
							/>
						</div>
					</div>
				)}

				<div className="md:col-span-2">
					<label className="block text-sm font-medium text-slate-700 mb-1.5">
						Tags / Keywords
					</label>
					<input
						className={inputStyle}
						placeholder="e.g. AI, Hackathon, Coding (comma separated)"
						value={eventData.tags || ""}
						onChange={(e) => handleTags(e.target.value)}
					/>
					<p className="text-xs text-slate-400 mt-1">
						Separate tags with commas
					</p>
				</div>
			</div>
		</div>
	);
});

export default BasicStep;
