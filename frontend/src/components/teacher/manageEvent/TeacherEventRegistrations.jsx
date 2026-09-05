import { useEffect, useState } from "react";
import { getEventRegistrations } from "@/services/eventServices";
import { updateEventRegistrationStatus } from "@/services/eventServices";
import toast from "react-hot-toast";

const TeacherEventRegistrations = ({ eventId, approvalBased = false }) => {
	const [registrations, setRegistrations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [processingId, setProcessingId] = useState(null);

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

	const updateStatus = async (registrationId, status) => {
		setProcessingId(registrationId);
		try {
			await updateEventRegistrationStatus(
				eventId,
				registrationId,
				status,
			);
			setRegistrations((current) =>
				current.map((registration) =>
					registration.registration_id === registrationId
						? { ...registration, status }
						: registration,
				),
			);
			toast.success(`Registration ${status}`);
		} catch (error) {
			toast.error(
				error.response?.data?.message ||
					"Failed to update registration",
			);
		} finally {
			setProcessingId(null);
		}
	};

	if (loading) {
		return <p>Loading registrations...</p>;
	}

	if (registrations.length === 0) {
		return (
			<div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
				<h2 className="text-xl font-semibold">No Registrations Yet</h2>

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
						{approvalBased && <th className="p-4">Action</th>}

						<th className="p-4">Registered On</th>
					</tr>
				</thead>

				<tbody>
					{registrations.map((registration) => (
						<tr
							key={registration.registration_id}
							className="border-b hover:bg-slate-50"
						>
							<td className="p-4">{registration.full_name}</td>

							<td className="p-4">{registration.email}</td>

							<td className="p-4">
								{registration.team_name || "-"}
							</td>

							<td className="p-4 capitalize">
								{registration.status}
							</td>

							{approvalBased && (
								<td className="p-4">
									{registration.status === "pending" ? (
										<div className="flex gap-2">
											<button
												disabled={
													processingId ===
													registration.registration_id
												}
												onClick={() =>
													updateStatus(
														registration.registration_id,
														"approved",
													)
												}
												className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
											>
												Approve
											</button>
											<button
												disabled={
													processingId ===
													registration.registration_id
												}
												onClick={() =>
													updateStatus(
														registration.registration_id,
														"rejected",
													)
												}
												className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
											>
												Reject
											</button>
										</div>
									) : (
										<span className="text-xs text-slate-400">
											Processed
										</span>
									)}
								</td>
							)}

							<td className="p-4">
								{new Date(
									registration.created_at,
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
