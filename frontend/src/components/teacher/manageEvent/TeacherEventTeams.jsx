import { useEffect, useState } from "react";
import { getEventTeams } from "@/services/eventServices";

export default function TeacherEventTeams({ eventId }) {
	const [teams, setTeams] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchTeams = async () => {
			try {
				const res = await getEventTeams(eventId);
				setTeams(res.teams || []);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		fetchTeams();
	}, [eventId]);

	if (loading) {
		return <p>Loading teams...</p>;
	}

	if (!teams.length) {
		return (
			<div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
				No teams have registered yet.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{teams.map((team) => (
				<div
					key={team.team_id}
					className="rounded-xl border border-slate-200 bg-white p-5"
				>
					<h3 className="text-lg font-semibold">
						{team.team_name}
					</h3>

					<p className="mt-2 text-sm text-slate-600">
						Captain: {team.created_by}
					</p>

					<p className="text-sm text-slate-600">
						Members: {team.member_count}
					</p>

					<p className="text-sm text-slate-600">
						Status: {team.status}
					</p>
				</div>
			))}
		</div>
	);
}