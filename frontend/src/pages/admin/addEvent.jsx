import { useEffect, useRef, useState } from "react";
import QuickEventForm from "../../components/event/quickEventForm";
import AdvancedEventWizard from "../../components/event/advancedEventWizard";

const emptyEvent = {
	title: "",
	subtitle: "",
	description: "",
	category: "",
	eventType: "",
	startAt: "",
	endAt: "",
};

const mapEvent = (data) => data;

const AddEvent = ({ initialData, isEditing = false }) => {
	const [advancedMode, setAdvancedMode] = useState(false);
	const [eventData, setEventData] = useState(emptyEvent);

	const hydrated = useRef(false);

	useEffect(() => {
		if (isEditing && initialData && !hydrated.current) {
			hydrated.current = true;
			setEventData(mapEvent(initialData));
		}
	}, [isEditing, initialData]);

	return (
		<div className="space-y-6">
			{!advancedMode ? (
				<QuickEventForm
					eventData={eventData}
					setEventData={setEventData}
					setAdvancedMode={setAdvancedMode}
					isEditing={isEditing}
				/>
			) : (
				<AdvancedEventWizard
					eventData={eventData}
					setEventData={setEventData}
					setAdvancedMode={setAdvancedMode}
					isEditing={isEditing}
				/>
			)}
		</div>
	);
};

export default AddEvent;
