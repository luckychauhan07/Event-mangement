import { useEffect, useState } from "react";
import {
	getEventRegistrations,
	getEventTeams,
} from "@/services/eventServices";
const TeacherDeclareResults = ({ event }) => {
	const [formData, setFormData] = useState({
		first: "",
		second: "",
		third: "",
		remarks: "",
	});
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
	const fetchParticipants = async () => {
		try {
			if (event.team.enabled) {
				const res = await getEventTeams(event.id);
				setParticipants(res.teams || []);
			} else {
				const res = await getEventRegistrations(event.id);
				setParticipants(res.registrations || []);
			}
		} catch (error) {
			console.error(error);
		}
	};

	fetchParticipants();
}, [event]);
	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

			<h3 className="mb-6 text-lg font-semibold">
				Declare Event Results
			</h3>

            <div className="space-y-5">

	<div>
		<label className="mb-2 block font-medium">
			Winner
		</label>

		<select
			value={formData.first}
			onChange={(e) =>
				setFormData({
					...formData,
					first: e.target.value,
				})
			}
			className="w-full rounded-lg border border-slate-300 p-3"
		>
			<option value="">Select</option>

{participants.map((participant) => (
	<option
		key={
			event.team.enabled
				? participant.team_id
				: participant.registration_id
		}
		value={
			event.team.enabled
				? participant.team_id
				: participant.registration_id
		}
	>
		{event.team.enabled
			? participant.team_name
			: participant.full_name}
	</option>
))}
		</select>
	</div>

</div>
		</div>
	);
};

export default TeacherDeclareResults;