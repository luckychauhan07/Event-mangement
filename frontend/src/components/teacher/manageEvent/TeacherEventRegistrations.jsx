import { useEffect, useState } from "react";
import { getEventRegistrations } from "@/services/eventServices";

const TeacherEventRegistrations = ({ eventId }) => {
	const [registrations, setRegistrations] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchRegistrations = async () => {
			try {
				const res = await getEventRegistrations(eventId);
				setRegistrations(res.registrations);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		fetchRegistrations();
	}, [eventId]);

	if (loading) {
		return <p>Loading registrations...</p>;
	}

	if (registrations.length === 0) {
		return (
			<div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
				<h2 className="text-xl font-semibold">
					No Registrations Yet
				</h2>

				<p className="mt-2 text-slate-500">
					No students have registered for this event.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">

			<table className="min-w-full">

				<thead className="border-b">

					<tr className="text-left">

						<th className="p-4">Student</th>

						<th className="p-4">Email</th>

						<th className="p-4">Team</th>

						<th className="p-4">Status</th>

						<th className="p-4">Registered On</th>

					</tr>

				</thead>

				<tbody>

					{registrations.map((registration) => (

						<tr
							key={registration.registration_id}
							className="border-b hover:bg-slate-50"
						>

							<td className="p-4">
								{registration.full_name}
							</td>

							<td className="p-4">
								{registration.email}
							</td>

							<td className="p-4">
								{registration.team_name || "-"}
							</td>

							<td className="p-4 capitalize">
								{registration.status}
							</td>

							<td className="p-4">
								{new Date(
									registration.created_at
								).toLocaleDateString()}
							</td>

						</tr>

					))}

				</tbody>

			</table>

		</div>
	);
};

export default TeacherEventRegistrations;