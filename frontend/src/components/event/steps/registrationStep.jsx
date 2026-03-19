import {
	Settings,
	Users,
	Calendar,
	AlertCircle,
	Shield,
	Clock,
	UserCheck,
	UsersRound,
	Info,
	CheckCircle,
} from "lucide-react";
import ToggleCard from "../ToggleCard";
import { forwardRef, useImperativeHandle } from "react";

const RegistrationStep = forwardRef(({ eventData, setEventData }, ref) => {
	const update = (f, v) => {
		setEventData({ ...eventData, [f]: v });
	};

	const updateNonNegativeNumber = (field, value, minValue = 0) => {
		if (value === "") {
			update(field, "");
			return;
		}

		const parsedValue = Number.parseInt(value, 10);
		if (Number.isNaN(parsedValue)) return;

		update(field, Math.max(minValue, parsedValue));
	};

	const getRegistrationDateError = () => {
		if (!eventData.registrationStart || !eventData.registrationEnd)
			return "";

		const startDate = new Date(eventData.registrationStart);
		const endDate = new Date(eventData.registrationEnd);
		const now = new Date();

		if (startDate < now) return "Registration start cannot be in the past";
		if (endDate <= startDate)
			return "Registration end must be after registration start";
		if (eventData.startAt) {
			const eventStartDate = new Date(eventData.startAt);
			if (endDate > eventStartDate)
				return "Registration end must be on or before event start";
		}

		return "";
	};

	const getTeamSizeError = () => {
		if (eventData.participationType !== "team") return "";
		if (!eventData.minTeamSize || !eventData.maxTeamSize) return "";
		if (eventData.minTeamSize > eventData.maxTeamSize) {
			return "Minimum team size cannot be greater than maximum team size";
		}
		return "";
	};

	const isPositiveInteger = (value) => {
		if (value === "" || value === null || value === undefined) {
			return false;
		}

		const parsedValue = Number(value);
		return Number.isInteger(parsedValue) && parsedValue > 0;
	};

	const isNonNegativeInteger = (value) => {
		if (value === "" || value === null || value === undefined) {
			return false;
		}

		const parsedValue = Number(value);
		return Number.isInteger(parsedValue) && parsedValue >= 0;
	};

	const registrationDateError = getRegistrationDateError();
	const teamSizeError = getTeamSizeError();
	useImperativeHandle(ref, () => ({
		validate() {
			if (!eventData.allowRegistration) {
				return true;
			}

			if (!eventData.registrationType) {
				return "Registration type is required";
			}
			if (!eventData.registrationStart) {
				return "Registration start date & time is required";
			}
			if (!eventData.registrationEnd) {
				return "Registration end date & time is required";
			}
			if (!eventData.participationType) {
				return "Participation type is required";
			}
			if (registrationDateError) {
				return registrationDateError;
			}

			if (
				eventData.participantLimit !== "" &&
				eventData.participantLimit !== null &&
				eventData.participantLimit !== undefined &&
				!isPositiveInteger(eventData.participantLimit)
			) {
				return "Participant limit must be a whole number greater than 0";
			}

			if (
				eventData.ageRestriction !== "" &&
				eventData.ageRestriction !== null &&
				eventData.ageRestriction !== undefined &&
				!isNonNegativeInteger(eventData.ageRestriction)
			) {
				return "Age restriction cannot be negative";
			}

			if (eventData.participationType === "team") {
				if (!isPositiveInteger(eventData.minTeamSize)) {
					return "Minimum team size must be at least 1";
				}
				if (!isPositiveInteger(eventData.maxTeamSize)) {
					return "Maximum team size must be at least 1";
				}
				if (teamSizeError) {
					return teamSizeError;
				}

				if (
					eventData.participantLimit &&
					Number(eventData.participantLimit) <
						Number(eventData.maxTeamSize)
				) {
					return "Participant limit cannot be smaller than maximum team size";
				}
			}

			return true;
		},
	}));

	const inputStyle =
		"w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white";

	const SelectCard = ({
		active,
		onClick,
		label,
		description,
		icon: Icon,
	}) => (
		<div
			onClick={onClick}
			className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
			${
				active
					? "border-indigo-500 bg-indigo-50 shadow-sm"
					: "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
			}`}
		>
			<div className="flex items-start gap-3">
				<div
					className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
					${active ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-400"}`}
				>
					<Icon size={16} />
				</div>
				<div>
					<p
						className={`font-medium ${active ? "text-indigo-700" : "text-slate-700"}`}
					>
						{label}
					</p>
					{description && (
						<p className="text-xs text-slate-500 mt-0.5">
							{description}
						</p>
					)}
				</div>
			</div>
		</div>
	);

	const toggleRegistration = () => {
		update("allowRegistration", eventData.allowRegistration ? false : true);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3 pb-4 border-b border-slate-100">
				<div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
					<Settings size={20} />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900">
						Registration Settings
					</h3>
					<p className="text-sm text-slate-500">
						Configure how participants can register for your event
					</p>
				</div>
			</div>

			<ToggleCard
				active={eventData.allowRegistration}
				onClick={toggleRegistration}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div
							className={`w-10 h-10 rounded-xl flex items-center justify-center
							${eventData.allowRegistration ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-400"}`}
						>
							<UserCheck size={20} />
						</div>
						<div>
							<h4 className="font-medium text-slate-800">
								Registration required
							</h4>
							<p className="text-xs text-slate-500">
								Participants are required to register for this
								event
							</p>
						</div>
					</div>
					<div
						className={`w-10 h-6 rounded-full transition-all duration-200 ${eventData.allowRegistration ? "bg-yellow-500" : "bg-slate-300"}`}
					>
						<div
							className={`w-4 h-4 rounded-full bg-white shadow-sm mt-1 transition-all duration-200 ${eventData.allowRegistration ? "ml-5" : "ml-1"}`}
						></div>
					</div>
				</div>
			</ToggleCard>

			{eventData.allowRegistration && (
				<div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
					<div>
						<label className="flex text-sm font-medium text-slate-700 mb-3 items-center gap-2">
							<Users size={16} className="text-indigo-500" />
							Registration Type
						</label>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<SelectCard
								active={eventData.registrationType === "open"}
								onClick={() =>
									update("registrationType", "open")
								}
								label="Open"
								description="Anyone can register"
								icon={CheckCircle}
							/>
							<SelectCard
								active={
									eventData.registrationType === "invite-only"
								}
								onClick={() =>
									update("registrationType", "invite-only")
								}
								label="Invite Only"
								description="By invitation only"
								icon={Users}
							/>
							<SelectCard
								active={
									eventData.registrationType ===
									"approval-based"
								}
								onClick={() =>
									update("registrationType", "approval-based")
								}
								label="Approval Based"
								description="Requires approval"
								icon={UserCheck}
							/>
						</div>
					</div>

					<div className="border-2 border-slate-200 rounded-xl p-5">
						<div className="flex items-center gap-2 mb-4">
							<Clock size={18} className="text-indigo-500" />
							<h4 className="font-medium text-slate-800">
								Registration Timeline
							</h4>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<div>
								<label
									htmlFor="registrationStart"
									className="block text-sm font-medium text-slate-700 mb-1.5"
								>
									Registration Start
								</label>
								<div className="relative">
									<Calendar
										className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
										size={18}
									/>
									<input
										type="datetime-local"
										id="registrationStart"
										value={
											eventData.registrationStart ?? ""
										}
										onChange={(e) =>
											update(
												"registrationStart",
												e.target.value,
											)
										}
										className={`${inputStyle} pl-10 ${registrationDateError ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : ""}`}
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor="registrationEnd"
									className="block text-sm font-medium text-slate-700 mb-1.5"
								>
									Registration End
								</label>
								<div className="relative">
									<Calendar
										className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
										size={18}
									/>
									<input
										type="datetime-local"
										id="registrationEnd"
										value={eventData.registrationEnd ?? ""}
										onChange={(e) =>
											update(
												"registrationEnd",
												e.target.value,
											)
										}
										className={`${inputStyle} pl-10 ${registrationDateError ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : ""}`}
									/>
								</div>
							</div>
						</div>

						{registrationDateError && (
							<div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
								<AlertCircle size={18} />
								{registrationDateError}
							</div>
						)}

						{!registrationDateError &&
							eventData.registrationStart &&
							eventData.registrationEnd && (
								<div className="mt-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
									<CheckCircle size={18} />
									Registration period is valid
								</div>
							)}
					</div>

					<div>
						<label className="flex text-sm font-medium text-slate-700 mb-3 items-center gap-2">
							<UsersRound size={16} className="text-indigo-500" />
							Participation Type
						</label>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<SelectCard
								active={
									eventData.participationType === "individual"
								}
								onClick={() =>
									update("participationType", "individual")
								}
								label="Individual"
								description="Participants register alone"
								icon={UserCheck}
							/>
							<SelectCard
								active={eventData.participationType === "team"}
								onClick={() =>
									update("participationType", "team")
								}
								label="Team"
								description="Participants form teams"
								icon={Users}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div>
							<label
								htmlFor="maxParticipants"
								className="block text-sm font-medium text-slate-700 mb-1.5"
							>
								Maximum Participant Limit
							</label>
							<div className="relative">
								<Users
									className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
									size={18}
								/>
								<input
									type="number"
									id="maxParticipants"
									placeholder="e.g. 200"
									min="0"
									step="1"
									value={eventData.participantLimit ?? ""}
									onChange={(e) =>
										updateNonNegativeNumber(
											"participantLimit",
											e.target.value,
										)
									}
									className={`${inputStyle} pl-10`}
								/>
							</div>
							<p className="text-xs text-slate-400 mt-1.5">
								Leave empty for unlimited participants
							</p>
						</div>

						<div>
							<label
								htmlFor="ageRestriction"
								className="block text-sm font-medium text-slate-700 mb-1.5"
							>
								Minimum Age Requirement
							</label>
							<div className="relative">
								<Shield
									className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
									size={18}
								/>
								<input
									type="number"
									id="ageRestriction"
									placeholder="e.g. 18"
									min="0"
									step="1"
									value={eventData.ageRestriction ?? ""}
									onChange={(e) =>
										updateNonNegativeNumber(
											"ageRestriction",
											e.target.value,
										)
									}
									className={`${inputStyle} pl-10`}
								/>
							</div>
							<p className="text-xs text-slate-400 mt-1.5">
								Leave empty for no age restriction
							</p>
						</div>
					</div>

					{eventData.participationType === "team" && (
						<div className="border-2 border-indigo-200 bg-indigo-50/50 rounded-xl p-5 animate-in fade-in slide-in-from-top-2 duration-300">
							<div className="flex items-center gap-2 mb-4">
								<Users size={18} className="text-indigo-500" />
								<h4 className="font-medium text-slate-800">
									Team Configuration
								</h4>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
								<div>
									<label
										htmlFor="minTeamSize"
										className="block text-sm font-medium text-slate-700 mb-1.5"
									>
										Minimum Team Size
									</label>
									<input
										type="number"
										id="minTeamSize"
										min="1"
										placeholder="e.g. 2"
										value={eventData.minTeamSize ?? ""}
										onChange={(e) => {
											updateNonNegativeNumber(
												"minTeamSize",
												e.target.value,
												1,
											);
										}}
										className={`${inputStyle} ${teamSizeError ? "border-red-400" : ""}`}
									/>
								</div>
								<div>
									<label
										htmlFor="maxTeamSize"
										className="block text-sm font-medium text-slate-700 mb-1.5"
									>
										Maximum Team Size
									</label>
									<input
										type="number"
										id="maxTeamSize"
										placeholder="e.g. 5"
										min="1"
										step="1"
										value={eventData.maxTeamSize ?? ""}
										onChange={(e) =>
											updateNonNegativeNumber(
												"maxTeamSize",
												e.target.value,
												1,
											)
										}
										className={`${inputStyle} ${teamSizeError ? "border-red-400" : ""}`}
									/>
								</div>
							</div>

							{teamSizeError && (
								<div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
									<AlertCircle size={18} />
									{teamSizeError}
								</div>
							)}

							{!teamSizeError &&
								eventData.minTeamSize &&
								eventData.maxTeamSize && (
									<div className="mt-4 flex items-center gap-2 text-sm text-indigo-600 bg-indigo-100 border border-indigo-200 px-4 py-3 rounded-xl">
										<Info size={18} />
										Teams can have {
											eventData.minTeamSize
										}{" "}
										to {eventData.maxTeamSize} members
									</div>
								)}
						</div>
					)}

					<div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
						<Info
							size={20}
							className="text-amber-500 shrink-0 mt-0.5"
						/>
						<div>
							<p className="text-sm font-medium text-amber-800">
								Registration Tips
							</p>
							<ul className="text-xs text-amber-700 mt-1 space-y-1 list-disc list-inside">
								<li>
									Set registration deadline at least 1-2 days
									before the event
								</li>
								<li>
									For team events, ensure clear size
									guidelines
								</li>
								<li>
									Approval-based registration requires manual
									review of each application
								</li>
							</ul>
						</div>
					</div>
				</div>
			)}

			{eventData.allowRegistration !== "yes" && (
				<div className="bg-slate-100 border-2 border-slate-200 rounded-xl p-6 text-center">
					<div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3">
						<UserCheck size={24} className="text-slate-400" />
					</div>
					<p className="text-slate-600 font-medium">
						Registration is disabled
					</p>
					<p className="text-sm text-slate-500 mt-1">
						Enable registration to configure settings
					</p>
				</div>
			)}
		</div>
	);
});

export default RegistrationStep;
