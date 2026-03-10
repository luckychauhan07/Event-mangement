import { useEffect, useState } from "react";
import { approveTeacher, getPendingTeachers } from "../services/adminServices";
import { logout } from "../utils/auth";

const AdminTeacherApprovals = () => {
	const [teachers, setTeachers] = useState([]);

	const fetchTeachers = async () => {
		const res = await getPendingTeachers();

		setTeachers(res.data);
	};

	useEffect(() => {
		fetchTeachers();
	}, []);

	const handleApprove = async (id) => {
		await approveTeacher(id);

		setTeachers(teachers.filter((t) => t.user_id !== id));
	};

	return (
		<>
			<div>
				<button
					onClick={logout}
					className="text-red-500 hover:text-red-600"
				>
					Logout
				</button>
			</div>
			<div className="p-6">
				<h2 className="text-2xl font-semibold mb-6">
					Pending Teacher Requests
				</h2>

				<div className="bg-white shadow rounded-lg">
					<table className="w-full">
						<thead className="border-b">
							<tr className="text-left">
								<th className="p-3">Name</th>
								<th className="p-3">Email</th>
								<th className="p-3">Phone</th>
								<th className="p-3">Action</th>
							</tr>
						</thead>

						<tbody>
							{teachers.length === 0 && (
								<tr>
									<td
										className="p-4 text-gray-500"
										colSpan="4"
									>
										No pending requests
									</td>
								</tr>
							)}

							{teachers.map((teacher) => (
								<tr key={teacher.user_id} className="border-b">
									<td className="p-3">{teacher.full_name}</td>

									<td className="p-3">{teacher.email}</td>

									<td className="p-3">
										{teacher.phone || "-"}
									</td>

									<td className="p-3">
										<button
											onClick={() =>
												handleApprove(teacher.user_id)
											}
											className="bg-green-600 text-white px-3 py-1 rounded"
										>
											Approve
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
};

export default AdminTeacherApprovals;
