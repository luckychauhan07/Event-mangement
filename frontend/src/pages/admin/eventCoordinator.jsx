import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const EventCoordinator = () => {
	const [loading, setLoading] = useState(true);
	const [eventCoordinators, setEventCoordinators] = useState([]);
	const { id } = useParams();
	useEffect(() => {
		// Simulate fetching event coordinators for the given event ID
		setTimeout(() => {
			setEventCoordinators([
				{ id: 1, name: "John Doe", email: "john.doe@example.com" },
				{ id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
			]);
			setLoading(false);
		}, 1000);
	}, [id]);

	return (
		<div className="p-6 bg-white rounded-lg shadow">
			<h2 className="text-2xl font-bold mb-4">
				Assign Event Coordinator
			</h2>
			{loading ? (
				<p>Loading coordinators...</p>
			) : (
				<>
					<div>
						<p>assigned coordinators to current event</p>
						<ul className="space-y-4">
							{eventCoordinators.map((coordinator) => (
								<li
									key={coordinator.id}
									className="flex items-center justify-between p-4 border rounded-lg"
								>
									<div>
										<p className="text-lg font-semibold">
											{coordinator.name}
										</p>
										<p className="text-sm text-gray-500">
											{coordinator.email}
										</p>
										<p>{coordinator.role}</p>
									</div>
									<button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
										Remove
									</button>
								</li>
							))}
						</ul>

						<div>
							<p>Assigned new coordinators</p>
							<button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
								Assign New Coordinator
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
};
export default EventCoordinator;
