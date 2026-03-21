import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Check, ArrowLeft } from "lucide-react";

import Stepper from "./stepper";

import BasicStep from "./steps/basicStep";
import OrganizersStep from "./steps/organizersStep";
import ScheduleStep from "./steps/schduleStep";
import RegistrationStep from "./steps/registrationStep";
import ResourcesStep from "./steps/resourcesStep";
import MediaStep from "./steps/mediaStep";
import AudienceStep from "./steps/audienceStep";
import FormBuilderStep from "./steps/formBuilderStep";
import ResultStep from "./steps/resultStep";
import { createEvent } from "../../services/eventServices";
import toast from "react-hot-toast";

const isBlank = (value) => !value || !String(value).trim();

const isPositiveNumber = (value) => {
	if (value === "" || value === null || value === undefined) return false;
	const parsedValue = Number(value);
	return Number.isFinite(parsedValue) && parsedValue > 0;
};

const isPositiveInteger = (value) => {
	if (value === "" || value === null || value === undefined) return false;
	const parsedValue = Number(value);
	return Number.isInteger(parsedValue) && parsedValue > 0;
};

const isValidHttpUrl = (value) => {
	if (!value) return false;

	try {
		const parsedUrl = new URL(String(value).trim());
		return (
			parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
		);
	} catch {
		return false;
	}
};

const validateEventBeforeSubmit = (eventData) => {
	if (isBlank(eventData.title)) return "Event title is required";
	if (isBlank(eventData.description)) return "Event description is required";
	if (isBlank(eventData.category)) return "Event category is required";
	if (isBlank(eventData.eventType)) return "Event type is required";

	if (
		eventData.eventType === "paid" &&
		!isPositiveNumber(eventData.entryFee)
	) {
		return "Entry fee must be greater than 0 for paid events";
	}

	if (isBlank(eventData.organizerUnit)) {
		return "Organizing department is required";
	}
	if (isBlank(eventData.primaryCoordinator)) {
		return "Primary coordinator is required";
	}

	if (!eventData.startAt || !eventData.endAt) {
		return "Event start and end date/time are required";
	}

	const startDate = new Date(eventData.startAt);
	const endDate = new Date(eventData.endAt);
	if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
		return "Event schedule contains an invalid date/time";
	}

	if (startDate < new Date()) {
		return "Event start date cannot be in the past";
	}
	if (endDate <= startDate) {
		return "Event end date must be after start date";
	}

	const eventMode = String(eventData.eventMode || "").toLowerCase();
	if (!eventMode) return "Event mode is required";

	const requiresOfflineVenue =
		eventMode === "offline" || eventMode === "hybrid";
	const requiresOnlineLink = eventMode === "online" || eventMode === "hybrid";

	if (requiresOfflineVenue && isBlank(eventData.venue)) {
		return "Venue is required for offline or hybrid events";
	}
	if (requiresOnlineLink && isBlank(eventData.onlineLink)) {
		return "Online meeting link is required for online or hybrid events";
	}
	if (requiresOnlineLink && !isValidHttpUrl(eventData.onlineLink)) {
		return "Online meeting link must be a valid URL (http/https)";
	}

	if (eventData.allowRegistration === "yes") {
		if (isBlank(eventData.registrationType)) {
			return "Registration type is required";
		}
		if (!eventData.registrationStart || !eventData.registrationEnd) {
			return "Registration start and end date/time are required";
		}
		if (isBlank(eventData.participationType)) {
			return "Participation type is required";
		}

		const registrationStart = new Date(eventData.registrationStart);
		const registrationEnd = new Date(eventData.registrationEnd);
		if (
			Number.isNaN(registrationStart.getTime()) ||
			Number.isNaN(registrationEnd.getTime())
		) {
			return "Registration timeline contains an invalid date/time";
		}

		if (registrationStart < new Date()) {
			return "Registration start cannot be in the past";
		}
		if (registrationEnd <= registrationStart) {
			return "Registration end must be after registration start";
		}
		if (registrationEnd > startDate) {
			return "Registration must close on or before event start";
		}

		if (
			eventData.participantLimit !== "" &&
			eventData.participantLimit !== null &&
			eventData.participantLimit !== undefined &&
			!isPositiveInteger(eventData.participantLimit)
		) {
			return "Participant limit must be a whole number greater than 0";
		}

		if (eventData.participationType === "team") {
			if (!isPositiveInteger(eventData.minTeamSize)) {
				return "Minimum team size must be at least 1";
			}
			if (!isPositiveInteger(eventData.maxTeamSize)) {
				return "Maximum team size must be at least 1";
			}
			if (Number(eventData.minTeamSize) > Number(eventData.maxTeamSize)) {
				return "Minimum team size cannot be greater than maximum team size";
			}
		}
	}

	if (
		eventData.accommodation === true &&
		isBlank(eventData.accommodationDetails)
	) {
		return "Please provide accommodation details";
	}
	if (
		eventData.equipmentRequired === true &&
		isBlank(eventData.equipmentName)
	) {
		return "Please specify the equipment required";
	}
	if (eventData.catering === true && isBlank(eventData.cateringDetails)) {
		return "Please provide catering details";
	}

	if (eventData.promoVideo && !isValidHttpUrl(eventData.promoVideo)) {
		return "Promo video link must be a valid URL (http/https)";
	}

	const audienceRoles = eventData.audienceRoles || [];
	if (audienceRoles.length === 0) {
		return "Select at least one target audience role";
	}
	if (
		audienceRoles.includes("Students") &&
		(eventData.studentYears || []).length === 0
	) {
		return "Select at least one student year for student audience";
	}
	if (!eventData.interCollege) {
		return "Please choose inter-college participation preference";
	}

	if (eventData.allowRegistration === "yes") {
		const customFields = eventData.registrationSchema || [];
		const normalizedLabels = [];

		for (let index = 0; index < customFields.length; index += 1) {
			const field = customFields[index];
			const label = String(field.label || "").trim();

			if (!label) {
				return `Custom field ${index + 1} must have a label`;
			}

			normalizedLabels.push(label.toLowerCase());

			const requiresOptions =
				field.type === "select" || field.type === "checkbox";
			if (!requiresOptions) continue;

			const options = (field.options || []).map((option) =>
				String(option || "").trim(),
			);
			if (options.length === 0) {
				return `${label} must include at least one option`;
			}
			if (options.some((option) => !option)) {
				return `${label} contains an empty option`;
			}
			const uniqueOptions = new Set(
				options.map((option) => option.toLowerCase()),
			);
			if (uniqueOptions.size !== options.length) {
				return `${label} contains duplicate options`;
			}
		}

		if (new Set(normalizedLabels).size !== normalizedLabels.length) {
			return "Custom field labels must be unique";
		}
	}

	const resultConfig = eventData.resultConfig || {};
	if (resultConfig.enabled) {
		if (isBlank(resultConfig.type)) {
			return "Select a result type";
		}

		if (resultConfig.type !== "participation") {
			if (!isPositiveInteger(resultConfig.positions)) {
				return "Number of winners must be a whole number greater than 0";
			}
		}

		if (resultConfig.type === "score") {
			if (!isPositiveInteger(resultConfig.judgesCount)) {
				return "Number of judges must be a whole number greater than 0";
			}

			const criteria = (resultConfig.criteria || [])
				.map((criterion) => String(criterion || "").trim())
				.filter(Boolean);
			if (criteria.length === 0) {
				return "Add at least one evaluation criterion";
			}
		}
	}

	return true;
};

const AdvancedEventWizard = ({ eventData, setEventData, setAdvancedMode }) => {
	const [step, setStep] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const refStep = useRef();
	const showValidationError = (message) => {
		toast.error(message, { id: "advanced-event-validation" });
	};

	const handleSubmit = async (data) => {
		if (data.eventRecurrence === "No Recurrence" && !data.eventRecurrence) {
			data.eventRecurrence = "";
		}
		if (
			data.allowRegistration === false ||
			data.allowRegistration === "no"
		) {
			data.registrationType = "";
			data.registrationStart = "";
			data.registrationEnd = "";
			data.participationType = "";
			data.participantLimit = "";
			data.minTeamSize = "";
			data.maxTeamSize = "";
		}
		if (!data.accommodation) {
			data.accommodationDetails = "";
		}
		if (!data.equipmentRequired) {
			data.equipmentName = "";
		}
		if (!data.catering) {
			data.cateringDetails = "";
		}
		if (data.resultConfig?.enabled !== true) {
			data.resultConfig = {
				enabled: false,
			};
		}

		const submitValidation = validateEventBeforeSubmit(data);
		if (submitValidation !== true) {
			showValidationError(submitValidation);
			return;
		}

		try {
			setIsSubmitting(true);
			const response = await createEvent(data);
			toast.success(`${response.message} 🎉`, {
				id: "advanced-event-submit",
			});
			if (response.eventId && response.status === "success") {
				setTimeout(() => {
					window.location.href = `/event/${response.eventId}`;
				}, 1500);
			}
		} catch (err) {
			toast.error(
				err.response?.data?.message || "Failed to create event",
				{ id: "advanced-event-submit" },
			);
		} finally {
			setIsSubmitting(false);
		}
	};
	const handleNext = () => {
		const validation = refStep.current?.validate?.() ?? true;
		if (validation === true) {
			setStep((currentStep) => currentStep + 1);
		} else {
			showValidationError(
				validation || "Please fill all required fields",
			);
		}
	};

	const steps = [
		BasicStep,
		OrganizersStep,
		ScheduleStep,
		RegistrationStep,
		ResourcesStep,
		MediaStep,
		AudienceStep,
		FormBuilderStep,
		ResultStep,
	];

	const CurrentStep = steps[step];

	return (
		<div className="space-y-6">
			{/* Back Button */}
			<button
				onClick={() => setAdvancedMode(false)}
				className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
			>
				<ArrowLeft size={18} />
				Back to Quick Create
			</button>

			{/* Main Card */}
			<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
				{/* Stepper */}
				<div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
					<Stepper step={step} />
				</div>

				{/* Step Content */}
				<div className="p-6">
					<CurrentStep
						eventData={eventData}
						setEventData={setEventData}
						ref={refStep}
					/>
				</div>

				{/* Navigation */}
				<div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50/50">
					{step > 0 ? (
						<button
							onClick={() => setStep(step - 1)}
							className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
						>
							<ChevronLeft size={18} />
							Previous
						</button>
					) : (
						<div></div>
					)}

					{step < steps.length - 1 ? (
						<button
							onClick={() => {
								console.log(eventData);
								handleNext();
							}}
							className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5"
						>
							Next
							<ChevronRight size={18} />
						</button>
					) : (
						<button
							disabled={isSubmitting}
							className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5"
							onClick={() => handleSubmit(eventData)}
						>
							<Check size={18} />
							{isSubmitting ? "Creating..." : "Create Event"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default AdvancedEventWizard;
