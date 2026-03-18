import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, ArrowLeft } from "lucide-react";

import Stepper from "./Stepper";

import BasicStep from "./steps/basicStep";
import OrganizersStep from "./steps/organizersStep";
import ScheduleStep from "./steps/schduleStep";
import RegistrationStep from "./steps/RegistrationStep";
import ResourcesStep from "./steps/ResourcesStep";
import MediaStep from "./steps/MediaStep";
import AudienceStep from "./steps/AudienceStep";
import FormBuilderStep from "./steps/FormBuilderStep";
import ResultStep from "./steps/ResultStep";

const AdvancedEventWizard = ({ eventData, setEventData, setAdvancedMode }) => {
	const [step, setStep] = useState(0);

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
								setStep(step + 1);
								console.log(eventData);
							}}
							className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5"
						>
							Next
							<ChevronRight size={18} />
						</button>
					) : (
						<button className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5">
							<Check size={18} />
							Create Event
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default AdvancedEventWizard;
