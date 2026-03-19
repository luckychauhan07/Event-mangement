import { createEvent } from "../../services/eventServices";
import toast from "react-hot-toast";
import {
	Calendar,
	MapPin,
	Link,
	Tag,
	FileText,
	DollarSign,
} from "lucide-react";

const QuickEventForm = ({ eventData, setEventData, setAdvancedMode }) => {
	const handleChange = (field, value) => {
		console.log(field, value);
		setEventData({
			...eventData,
			[field]: value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!eventData.title) return toast.error("Event title is required");
		if (!eventData.description)
			return toast.error("Event description required");
		if (!eventData.category) return toast.error("Select event category");
		if (!eventData.eventType) return toast.error("Select event type");
		if (!eventData.eventMode) return toast.error("Select event mode");

		if (eventData.eventType === "paid" && !eventData.entryFee) {
			return toast.error("Entry fee required for paid event");
		}

		if (!eventData.startAt || !eventData.endAt) {
			return toast.error("Select event start and end date");
		}

		if (new Date(eventData.startAt) >= new Date(eventData.endAt)) {
			return toast.error("End date must be after start date");
		}

		try {
			await createEvent(eventData);
			toast.success("Event created successfully 🎉");
		} catch (err) {
			toast.error(
				err.response?.data?.message || "Failed to create event",
			);
		}
	};

	const inputStyle =
		"w-full border-2 border-slate-200 rounded-xl px-10 py-3 text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white";

	return (
		<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
			{/* Header */}
			<div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
						<Calendar size={20} />
					</div>
					<div>
						<h2 className="text-lg font-semibold text-slate-900">
							Quick Create Event
						</h2>
						<p className="text-sm text-slate-500">
							Create a basic event quickly. You can add advanced
							settings later.
						</p>
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="p-6 space-y-6">
				{/* TITLE + SUBTITLE */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div className="relative">
						<label className="block text-sm font-medium text-slate-700 mb-1.5">
							Event Title <span className="text-red-500">*</span>
						</label>
						<div className="relative">
							<Tag
								className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
								size={18}
							/>
							<input
								placeholder="e.g. Hackathon 2026"
								className={inputStyle}
								value={eventData.title || ""}
								onChange={(e) =>
									handleChange("title", e.target.value)
								}
							/>
						</div>
					</div>

					<div className="relative">
						<label className="block text-sm font-medium text-slate-700 mb-1.5">
							Event Subtitle
						</label>
						<input
							placeholder="AI Innovation Challenge"
							className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
							value={eventData.subtitle || ""}
							onChange={(e) =>
								handleChange("subtitle", e.target.value)
							}
						/>
					</div>
				</div>

				{/* DESCRIPTION */}
				<div className="relative">
					<label className="block text-sm font-medium text-slate-700 mb-1.5">
						Event Description{" "}
						<span className="text-red-500">*</span>
					</label>
					<div className="relative">
						<FileText
							className="absolute left-3 top-3 text-slate-400"
							size={18}
						/>
						<textarea
							rows="3"
							placeholder="Describe the event..."
							className="w-full border-2 border-slate-200 rounded-xl px-10 py-3 text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none"
							value={eventData.description || ""}
							onChange={(e) =>
								handleChange("description", e.target.value)
							}
						/>
					</div>
				</div>

				{/* SELECT FIELDS */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1.5">
							Category <span className="text-red-500">*</span>
						</label>
						<select
							className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white"
							value={eventData.category || ""}
							onChange={(e) =>
								handleChange("category", e.target.value)
							}
						>
							<option value="" disabled>
								Select Category
							</option>
							<option value="Technical">Technical</option>
							<option value="Cultural">Cultural</option>
							<option value="Sports">Sports</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1.5">
							Event Type <span className="text-red-500">*</span>
						</label>
						<select
							className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white"
							value={eventData.eventType || ""}
							onChange={(e) =>
								handleChange("eventType", e.target.value)
							}
						>
							<option value="" disabled>
								Select Type
							</option>
							<option value="paid">Paid</option>
							<option value="free">Free</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1.5">
							Event Mode <span className="text-red-500">*</span>
						</label>
						<select
							className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white"
							value={eventData.eventMode || ""}
							onChange={(e) =>
								handleChange("eventMode", e.target.value)
							}
						>
							<option value="" disabled>
								Select Mode
							</option>
							<option value="offline">Offline</option>
							<option value="online">Online</option>
							<option value="hybrid">Hybrid</option>
						</select>
					</div>
				</div>

				{/* ENTRY FEE */}
				{eventData.eventType === "paid" && (
					<div className="relative transition-all duration-300 animate-in fade-in slide-in-from-top-2">
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
								placeholder="200"
								className={inputStyle}
								value={eventData.entryFee || ""}
								onChange={(e) =>
									handleChange("entryFee", e.target.value)
								}
							/>
						</div>
					</div>
				)}

				{/* VENUE */}
				{(eventData.eventMode === "offline" ||
					eventData.eventMode === "hybrid") && (
					<div className="relative transition-all duration-300 animate-in fade-in slide-in-from-top-2">
						<label className="block text-sm font-medium text-slate-700 mb-1.5">
							Venue
						</label>
						<div className="relative">
							<MapPin
								className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
								size={18}
							/>
							<input
								placeholder="Auditorium Hall A"
								className={inputStyle}
								value={eventData.venue || ""}
								onChange={(e) =>
									handleChange("venue", e.target.value)
								}
							/>
						</div>
					</div>
				)}

				{/* ONLINE LINK */}
				{(eventData.eventMode === "online" ||
					eventData.eventMode === "hybrid") && (
					<div className="relative transition-all duration-300 animate-in fade-in slide-in-from-top-2">
						<label className="block text-sm font-medium text-slate-700 mb-1.5">
							Online Link
						</label>
						<div className="relative">
							<Link
								className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
								size={18}
							/>
							<input
								placeholder="https://meet.google.com/..."
								className={inputStyle}
								value={eventData.onlineLink || ""}
								onChange={(e) =>
									handleChange("onlineLink", e.target.value)
								}
							/>
						</div>
					</div>
				)}

				{/* DATE */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div className="relative">
						<label className="block text-sm font-medium text-slate-700 mb-1.5">
							Start Date & Time
						</label>
						<div className="relative">
							<Calendar
								className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
								size={18}
							/>
							<input
								type="datetime-local"
								className={inputStyle}
								value={eventData.startAt || ""}
								onChange={(e) =>
									handleChange("startAt", e.target.value)
								}
							/>
						</div>
					</div>

					<div className="relative">
						<label className="block text-sm font-medium text-slate-700 mb-1.5">
							End Date & Time
						</label>
						<div className="relative">
							<Calendar
								className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
								size={18}
							/>
							<input
								type="datetime-local"
								min={eventData.startAt}
								className={inputStyle}
								value={eventData.endAt || ""}
								onChange={(e) =>
									handleChange("endAt", e.target.value)
								}
							/>
						</div>
					</div>
				</div>

				{/* FOOTER */}
				<div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100">
					<button
						type="button"
						onClick={() => setAdvancedMode(true)}
						className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-blue-200 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all hover:-translate-y-0.5"
					>
						More Customization
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>

					<button
						type="submit"
						className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5"
						// onClick={() => handleSubmit(eventData)}
					>
						<Calendar size={18} />
						Create Event
					</button>
				</div>
			</form>
		</div>
	);
};

export default QuickEventForm;
