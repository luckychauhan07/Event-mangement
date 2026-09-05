import { useEffect, useState } from "react";
import {
	getEventRegistrations,
	getEventTeams,
	createEventResults,
} from "@/services/eventServices";
import toast from "react-hot-toast";
const TeacherDeclareResults = ({ event }) => {
	const configuredPositions = Number(event.resultConfig?.positions) || 3;
	const [formData, setFormData] = useState(
		Array.from({ length: configuredPositions }, (_, index) => ({
			position: index + 1,
			participant: "",
			rankLabel:
				index === 0
					? "Winner"
					: `${index + 1}${index === 1 ? "nd" : "th"} Place`,
			score: "",
			remarks: "",
		})),
	);
	const [participants, setParticipants] = useState([]);
	const [saving, setSaving] = useState(false);

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

	const updateResult = (index, field, value) => {
		setFormData((previous) =>
			previous.map((result, resultIndex) =>
				resultIndex === index ? { ...result, [field]: value } : result,
			),
		);
	};

	const handleSubmit = async (submitEvent) => {
		submitEvent.preventDefault();
		if (formData.some((result) => !result.participant)) {
			toast.error("Select a participant for every position");
			return;
		}

		setSaving(true);
		try {
			await createEventResults(
				event.id,
				formData.map((result) => ({
					position: result.position,
					registrationId: event.team.enabled
						? null
						: result.participant,
					teamId: event.team.enabled ? result.participant : null,
					rankLabel: result.rankLabel,
					score: result.score || null,
					remarks: result.remarks || null,
				})),
			);
			toast.success("Event results declared successfully");
			window.location.reload();
		} catch (error) {
			toast.error(
				error.response?.data?.message || "Failed to declare results",
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
			<h3 className="mb-6 text-lg font-semibold">
				Declare Event Results
			</h3>

			<form onSubmit={handleSubmit} className="space-y-5">
				{formData.map((result, index) => (
					<div
						key={result.position}
						className="rounded-xl border border-slate-200 p-4"
					>
						<label className="mb-2 block font-medium">
							Position {result.position}
						</label>

						<select
							value={result.participant}
							onChange={(e) =>
								updateResult(
									index,
									"participant",
									e.target.value,
								)
							}
							className="w-full rounded-lg border border-slate-300 p-3"
						>
							<option value="">Select participant</option>

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
						<input
							value={result.rankLabel}
							onChange={(e) =>
								updateResult(index, "rankLabel", e.target.value)
							}
							className="mt-3 w-full rounded-lg border border-slate-300 p-3"
							placeholder="Rank label"
						/>
						<input
							type="number"
							value={result.score}
							onChange={(e) =>
								updateResult(index, "score", e.target.value)
							}
							className="mt-3 w-full rounded-lg border border-slate-300 p-3"
							placeholder="Score (optional)"
						/>
						<textarea
							value={result.remarks}
							onChange={(e) =>
								updateResult(index, "remarks", e.target.value)
							}
							className="mt-3 w-full rounded-lg border border-slate-300 p-3"
							placeholder="Remarks (optional)"
						/>
					</div>
				))}
				<button
					type="submit"
					disabled={saving}
					className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
				>
					{saving ? "Saving..." : "Save results"}
				</button>
			</form>
		</div>
	);
};

export default TeacherDeclareResults;
