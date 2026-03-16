import { useState } from "react";

import EventStepper from "../../components/event/EventStepper";
import QuickEventForm from "../../components/event/quickEventForm";

const AddEvent = () => {
	const [advancedMode, setAdvancedMode] = useState(false);

	const [eventData, setEventData] = useState({
		title: "",
		subtitle: "",
		description: "",
		category: "",
		eventType: "free",
		startAt: "",
		endAt: "",
		mode: "",
	});

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-6">Create New Event</h1>

			{!advancedMode && (
				<QuickEventForm
					eventData={eventData}
					setEventData={setEventData}
					setAdvancedMode={setAdvancedMode}
				/>
			)}

			{advancedMode && (
				<EventStepper
					eventData={eventData}
					setEventData={setEventData}
				/>
			)}
		</div>
	);
};

export default AddEvent;
