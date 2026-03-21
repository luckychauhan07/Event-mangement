import { Home, Package, Wrench, Utensils } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";

const ResourcesStep = forwardRef(({ eventData, setEventData }, ref) => {
	const update = (f, v) => setEventData({ ...eventData, [f]: v });
	const isBlank = (value) => !value || !String(value).trim();
	const trueOrFalse = (value) => {
		if (value === "true") return true;
		if (value === "false") return false;
		return false;
	};
	useImperativeHandle(ref, () => ({
		validate() {
			if (
				eventData.accommodation === true &&
				isBlank(eventData.accommodationDetails)
			) {
				return "Please provide details about the accommodation provided";
			}
			if (
				eventData.equipmentRequired === true &&
				isBlank(eventData.equipmentName)
			) {
				return "Please specify the equipment required for the event";
			}
			if (
				eventData.catering === true &&
				isBlank(eventData.cateringDetails)
			) {
				return "Please provide catering details";
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
				<div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
					<Package size={20} />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900">
						Resources & Facilities
					</h3>
					<p className="text-sm text-slate-500">
						Configure accommodation, equipment, and catering
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				<div>
					<label
						htmlFor="accommodation"
						className="block text-sm font-medium text-slate-700 mb-1.5"
					>
						Accommodation Provided
					</label>
					<div className="relative">
						<Home
							className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							size={18}
						/>
						<select
							id="accommodation"
							value={eventData.accommodation ?? ""}
							onChange={(e) =>
								update(
									"accommodation",
									trueOrFalse(e.target.value),
								)
							}
							className={`${inputStyle} pl-10`}
						>
							<option value="" disabled>
								Select option
							</option>
							<option value={false}>No</option>
							<option value={true}>Yes</option>
						</select>
					</div>
				</div>

				{eventData.accommodation === true && (
					<div className="animate-in fade-in slide-in-from-top-2 duration-300">
						<label
							htmlFor="accommodationDetails"
							className="block text-sm font-medium text-slate-700 mb-1.5"
						>
							Accommodation Details
						</label>
						<input
							type="text"
							id="accommodationDetails"
							placeholder="Enter accommodation details"
							value={eventData.accommodationDetails ?? ""}
							onChange={(e) =>
								update("accommodationDetails", e.target.value)
							}
							className={inputStyle}
						/>
					</div>
				)}

				<div>
					<label
						htmlFor="equipmentRequired"
						className="block text-sm font-medium text-slate-700 mb-1.5"
					>
						Equipment Required
					</label>
					<div className="relative">
						<Wrench
							className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							size={18}
						/>
						<select
							id="equipmentRequired"
							value={eventData.equipmentRequired ?? ""}
							onChange={(e) =>
								update(
									"equipmentRequired",
									trueOrFalse(e.target.value),
								)
							}
							className={`${inputStyle} pl-10`}
						>
							<option value="" disabled>
								Select option
							</option>
							<option value={true}>Yes</option>
							<option value={false}>No</option>
						</select>
					</div>
				</div>

				{eventData.equipmentRequired === true && (
					<div className="animate-in fade-in slide-in-from-top-2 duration-300">
						<label
							htmlFor="equipmentName"
							className="block text-sm font-medium text-slate-700 mb-1.5"
						>
							Equipment Name
						</label>
						<input
							type="text"
							id="equipmentName"
							placeholder="Enter equipment name"
							value={eventData.equipmentName ?? ""}
							onChange={(e) =>
								update("equipmentName", e.target.value)
							}
							className={inputStyle}
						/>
					</div>
				)}

				<div>
					<label
						htmlFor="catering"
						className="block text-sm font-medium text-slate-700 mb-1.5"
					>
						Catering Provided
					</label>
					<div className="relative">
						<Utensils
							className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							size={18}
						/>
						<select
							id="catering"
							value={eventData.catering ?? ""}
							onChange={(e) =>
								update("catering", trueOrFalse(e.target.value))
							}
							className={`${inputStyle} pl-10`}
						>
							<option value="" disabled>
								Select option
							</option>
							<option value={false}>No</option>
							<option value={true}>Yes</option>
						</select>
					</div>
				</div>

				{eventData.catering === true && (
					<div className="animate-in fade-in slide-in-from-top-2 duration-300">
						<label
							htmlFor="cateringDetails"
							className="block text-sm font-medium text-slate-700 mb-1.5"
						>
							Catering Details{" "}
							<span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="cateringDetails"
							placeholder="Enter catering details"
							value={eventData.cateringDetails ?? ""}
							onChange={(e) =>
								update("cateringDetails", e.target.value)
							}
							className={inputStyle}
						/>
					</div>
				)}
			</div>
		</div>
	);
});

export default ResourcesStep;
