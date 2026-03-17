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
		"w-full border border-gray-300 rounded-md px-10 py-2 transition-all duration-200 hover:border-sky-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none";

	return (
		<div className="max-w-5xl mx-auto bg-white border rounded-xl shadow-sm p-10">
			<h2 className="text-2xl font-semibold text-gray-800 mb-1">
				Quick Create Event
			</h2>

			<p className="text-gray-500 mb-8">
				Create a basic event quickly. You can add advanced settings
				later.
			</p>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* TITLE + SUBTITLE */}

				<div className="grid grid-cols-2 gap-6">
					<div className="relative">
						<label className="text-sm font-medium text-gray-700">
							Event Title *
						</label>

						<Tag
							className="absolute left-3 top-10 text-gray-400"
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

					<div>
						<label className="text-sm font-medium text-gray-700">
							Event Subtitle
						</label>

						<input
							placeholder="AI Innovation Challenge"
							className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 hover:border-sky-400 focus:ring-2 focus:ring-sky-200"
							value={eventData.subtitle || ""}
							onChange={(e) =>
								handleChange("subtitle", e.target.value)
							}
						/>
					</div>
				</div>

				{/* DESCRIPTION */}

				<div className="relative">
					<label className="text-sm font-medium text-gray-700">
						Event Description *
					</label>

					<FileText
						className="absolute left-3 top-10 text-gray-400"
						size={18}
					/>

					<textarea
						rows="3"
						placeholder="Describe the event..."
						className={inputStyle}
						value={eventData.description || ""}
						onChange={(e) =>
							handleChange("description", e.target.value)
						}
					/>
				</div>

				{/* SELECT FIELDS */}

				<div className="grid grid-cols-3 gap-6">
					<select
						className="border border-gray-300 rounded-md px-3 py-2 hover:border-sky-400 focus:ring-2 focus:ring-sky-200"
						value={eventData.category || ""}
						onChange={(e) =>
							handleChange("category", e.target.value)
						}
					>
						<option value="" disabled>
							Category
						</option>
						<option value="Technical">Technical</option>
						<option value="Cultural">Cultural</option>
						<option value="Sports">Sports</option>
					</select>

					<select
						className="border border-gray-300 rounded-md px-3 py-2 hover:border-sky-400 focus:ring-2 focus:ring-sky-200"
						value={eventData.eventType || ""}
						onChange={(e) =>
							handleChange("eventType", e.target.value)
						}
					>
						<option value="" disabled>
							Event Type
						</option>
						<option value="paid">Paid</option>
						<option value="free">Free</option>
					</select>

					<select
						className="border border-gray-300 rounded-md px-3 py-2 hover:border-sky-400 focus:ring-2 focus:ring-sky-200"
						value={eventData.eventMode || ""}
						onChange={(e) =>
							handleChange("eventMode", e.target.value)
						}
					>
						<option value="" disabled>
							Event Mode
						</option>
						<option value="offline">Offline</option>
						<option value="online">Online</option>
						<option value="hybrid">Hybrid</option>
					</select>
				</div>

				{/* ENTRY FEE */}

				{eventData.eventType === "paid" && (
					<div className="relative transition-all duration-300">
						<label className="text-sm font-medium text-gray-700">
							Entry Fee (₹)
						</label>

						<DollarSign
							className="absolute left-3 top-10 text-gray-400"
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
				)}

				{/* VENUE */}

				{(eventData.eventMode === "offline" ||
					eventData.eventMode === "hybrid") && (
					<div className="relative transition-all duration-300">
						<label className="text-sm font-medium text-gray-700">
							Venue
						</label>

						<MapPin
							className="absolute left-3 top-10 text-gray-400"
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
				)}

				{/* ONLINE LINK */}

				{(eventData.eventMode === "online" ||
					eventData.eventMode === "hybrid") && (
					<div className="relative transition-all duration-300">
						<label className="text-sm font-medium text-gray-700">
							Online Link
						</label>

						<Link
							className="absolute left-3 top-10 text-gray-400"
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
				)}

				{/* DATE */}

				<div className="grid grid-cols-2 gap-6">
					<div className="relative">
						<label className="text-sm font-medium text-gray-700">
							Start Date & Time
						</label>

						<Calendar
							className="absolute left-3 top-10 text-gray-400"
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

					<div className="relative">
						<label className="text-sm font-medium text-gray-700">
							End Date & Time
						</label>

						<Calendar
							className="absolute left-3 top-10 text-gray-400"
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

				{/* FOOTER */}

				<div className="flex justify-between pt-6">
					<button
						type="submit"
						className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition transform hover:scale-105"
					>
						Create Event
					</button>

					<button
						type="button"
						onClick={() => setAdvancedMode(true)}
						className="text-sky-600 hover:text-sky-700 hover:underline"
					>
						More Customization →
					</button>
				</div>
			</form>
		</div>
	);
};

export default QuickEventForm;
