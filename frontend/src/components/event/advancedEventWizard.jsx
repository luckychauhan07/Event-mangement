import { useState } from "react";

import Stepper from "./Stepper";

import BasicStep from "./steps/BasicStep";
import OrganizersStep from "./steps/OrganizersStep";
import ScheduleStep from "./steps/schduleStep";
import RegistrationStep from "./steps/RegistrationStep";
import ResourcesStep from "./steps/ResourcesStep";
import MediaStep from "./steps/MediaStep";
import AudienceStep from "./steps/AudienceStep";
import FormBuilderStep from "./steps/FormBuilderStep";
import ResultStep from "./steps/ResultStep";

const AdvancedEventWizard = ({ eventData, setEventData }) => {
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
		<div className="max-w-6xl mx-auto bg-white shadow rounded-xl p-8">
			<Stepper step={step} />

			<div className="mt-8">
				<CurrentStep
					eventData={eventData}
					setEventData={setEventData}
				/>
			</div>

			<div className="flex justify-between mt-8">
				{step > 0 && (
					<button
						onClick={() => setStep(step - 1)}
						className="px-4 py-2 border rounded"
					>
						Previous
					</button>
				)}

				{step < steps.length - 1 ? (
					<button
						onClick={() => {
							setStep(step + 1);
							console.log(eventData);
						}}
						className="px-4 py-2 bg-sky-600 text-white rounded"
					>
						Next
					</button>
				) : (
					<button className="px-4 py-2 bg-green-600 text-white rounded">
						Create Event
					</button>
				)}
			</div>
		</div>
	);
};

export default AdvancedEventWizard;
