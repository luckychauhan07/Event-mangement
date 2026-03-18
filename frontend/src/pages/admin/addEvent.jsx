import { useState } from "react";

// import EventStepper from "../../components/event/EventStepper";
import QuickEventForm from "../../components/event/quickEventForm";
import AdvancedEventWizard from "../../components/event/advancedEventWizard";

const AddEvent = () => {
	const [advancedMode, setAdvancedMode] = useState(false);

	const [eventData, setEventData] = useState({
		title: "",
		subtitle: "",
		description: "",
		category: "",
		eventType: "",
		startAt: "",
		endAt: "",
	});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur px-6 py-5 shadow-sm">
				<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
							Create New Event
						</h1>
						<p className="text-sm text-slate-500 mt-1">
							Fill all details carefully before submission
						</p>
					</div>
				</div>
			</div>

			{!advancedMode && (
				<QuickEventForm
					eventData={eventData}
					setEventData={setEventData}
					setAdvancedMode={setAdvancedMode}
				/>
			)}

			{advancedMode && (
				<AdvancedEventWizard
					eventData={eventData}
					setEventData={setEventData}
					setAdvancedMode={setAdvancedMode}
				/>
			)}
		</div>
	);
};

export default AddEvent;
