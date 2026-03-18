import { Calendar, MapPin, Link, Clock, RefreshCw, AlertCircle } from "lucide-react";

const ScheduleStep = ({ eventData, setEventData }) => {
	const update = (f, v) => setEventData({ ...eventData, [f]: v });

	// Date validation checks
	const validateDates = () => {
		if (!eventData.startAt || !eventData.endAt) return true;

		const startDate = new Date(eventData.startAt);
		const endDate = new Date(eventData.endAt);
		const now = new Date();

		if (startDate < now) return false;
		if (endDate <= startDate) return false;
		return true;
	};

	const getDateError = () => {
		if (!eventData.startAt || !eventData.endAt) return "";

		const startDate = new Date(eventData.startAt);
		const endDate = new Date(eventData.endAt);
		const now = new Date();

		if (startDate < now) return "Start date cannot be in the past";
		if (endDate <= startDate) return "End date must be after start date";
		return "";
	};

	const isDateValid = validateDates();
	const dateError = getDateError();

	const inputStyle =
		"w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white";

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3 pb-4 border-b border-slate-100">
				<div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
					<MapPin size={20} />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900">Schedule & Venue</h3>
					<p className="text-sm text-slate-500">Set the date, time, and location of your event</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				<div>
					<label
						htmlFor="startAt"
						className="block text-sm font-medium text-slate-700 mb-1.5"
					>
						Start Date & Time <span className="text-red-500">*</span>
					</label>
					<div className="relative">
						<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
						<input
							type="datetime-local"
							id="startAt"
							value={eventData.startAt || ""}
							onChange={(e) => update("startAt", e.target.value)}
							className={`${inputStyle} pl-10 ${!isDateValid ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : ""}`}
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="endAt"
						className="block text-sm font-medium text-slate-700 mb-1.5"
					>
						End Date & Time <span className="text-red-500">*</span>
					</label>
					<div className="relative">
						<Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
						<input
							type="datetime-local"
							id="endAt"
							value={eventData.endAt || ""}
							onChange={(e) => update("endAt", e.target.value)}
							className={`${inputStyle} pl-10 ${!isDateValid ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : ""}`}
						/>
					</div>
				</div>

				{dateError && (
					<div className="md:col-span-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
						<AlertCircle size={18} />
						{dateError}
					</div>
				)}

				<div className="md:col-span-2">
					<label
						htmlFor="eventMode"
						className="block text-sm font-medium text-slate-700 mb-1.5"
					>
						Event Mode <span className="text-red-500">*</span>
					</label>
					<select
						id="eventMode"
						value={eventData.eventMode || ""}
						onChange={(e) => update("eventMode", e.target.value)}
						className={inputStyle}
					>
						<option value="" disabled>Select Mode</option>
						<option>Online</option>
						<option>Offline</option>
						<option>Hybrid</option>
					</select>
				</div>

				{(eventData.eventMode === "Offline" ||
					eventData.eventMode === "Hybrid") && (
					<div className="animate-in fade-in slide-in-from-top-2 duration-300">
						<label
							htmlFor="venue"
							className="block text-sm font-medium text-slate-700 mb-1.5"
						>
							Venue <span className="text-red-500">*</span>
						</label>
						<div className="relative">
							<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
							<input
								type="text"
								id="venue"
								placeholder="e.g. Auditorium Hall A"
								value={eventData.venue || ""}
								onChange={(e) => update("venue", e.target.value)}
								className={`${inputStyle} pl-10`}
							/>
						</div>
					</div>
				)}

				{(eventData.eventMode === "Offline" ||
					eventData.eventMode === "Hybrid") && (
					<div className="animate-in fade-in slide-in-from-top-2 duration-300">
						<label
							htmlFor="rooms"
							className="block text-sm font-medium text-slate-700 mb-1.5"
						>
							Rooms / Spaces
						</label>
						<input
							type="text"
							id="rooms"
							placeholder="e.g. Lab 101, Seminar Hall"
							value={eventData.rooms || ""}
							onChange={(e) => update("rooms", e.target.value)}
							className={inputStyle}
						/>
					</div>
				)}

				{(eventData.eventMode === "Online" ||
					eventData.eventMode === "Hybrid") && (
					<div className="animate-in fade-in slide-in-from-top-2 duration-300">
						<label
							htmlFor="onlineLink"
							className="block text-sm font-medium text-slate-700 mb-1.5"
						>
							Online Meeting Link <span className="text-red-500">*</span>
						</label>
						<div className="relative">
							<Link className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
							<input
								type="text"
								id="onlineLink"
								placeholder="https://meet.google.com/..."
								value={eventData.onlineLink || ""}
								onChange={(e) => update("onlineLink", e.target.value)}
								className={`${inputStyle} pl-10`}
							/>
						</div>
					</div>
				)}

				<div className="md:col-span-2">
					<label
						htmlFor="recurrence"
						className="block text-sm font-medium text-slate-700 mb-1.5"
					>
						Recurrence
					</label>
					<div className="relative">
						<RefreshCw className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
						<select
							id="recurrence"
							value={eventData.recurrence || ""}
							onChange={(e) => update("recurrence", e.target.value)}
							className={`${inputStyle} pl-10`}
						>
							<option value="" disabled>Select Recurrence</option>
							<option>No Recurrence</option>
							<option>Daily</option>
							<option>Weekly</option>
							<option>Monthly</option>
						</select>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ScheduleStep;
