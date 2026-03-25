import {
	ChevronLeft,
	ChevronRight,
	Edit2,
	Mail,
	UsersIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserTable = ({
	paginatedUsers,
	currentPage,
	totalPages,
	handlePageChange,
	itemsPerPage,
	setItemsPerPage,
	filteredUsers,
	visiblePages,
	setCurrentPage,
}) => {
	const navigate = useNavigate();
	const getRoleColor = (role) => {
		switch (role?.toLowerCase()) {
			case "admin":
				return "bg-red-100 text-red-800 border-red-300";
			case "teacher":
				return "bg-blue-100 text-blue-800 border-blue-300";
			case "student":
				return "bg-green-100 text-green-800 border-green-300";
			default:
				return "bg-slate-100 text-slate-800 border-slate-300";
		}
	};

	const getStatusColor = (status) => {
		switch (status?.toLowerCase()) {
			case "active":
				return "bg-green-100 text-green-800 border-green-300";
			case "inactive":
				return "bg-slate-100 text-slate-800 border-slate-300";
			case "suspended":
				return "bg-red-100 text-red-800 border-red-300";
			default:
				return "bg-slate-100 text-slate-800 border-slate-300";
		}
	};
	return (
		<>
			<div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="bg-linear-to-r from-blue-50 via-slate-50 to-slate-100 border-b border-slate-200">
							<tr>
								<th className="text-left px-6 py-4 font-bold text-slate-900">
									Name
								</th>
								<th className="text-left px-6 py-4 font-bold text-slate-900">
									Email
								</th>
								<th className="text-left px-6 py-4 font-bold text-slate-900">
									Role
								</th>
								<th className="text-left px-6 py-4 font-bold text-slate-900">
									Status
								</th>
								<th className="text-center px-6 py-4 font-bold text-slate-900">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200">
							{paginatedUsers.length > 0 ? (
								paginatedUsers.map((user, idx) => (
									<tr
										key={user.user_id}
										className="hover:bg-slate-50 transition-colors duration-150"
									>
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
													{user.full_name
														?.charAt(0)
														.toUpperCase()}
												</div>
												<div>
													<p className="font-semibold text-slate-900">
														{user.full_name ||
															"N/A"}
													</p>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-2 text-slate-600">
												<Mail className="w-4 h-4 text-slate-400" />
												{user.email}
											</div>
										</td>
										<td className="px-6 py-4">
											<span
												className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getRoleColor(
													user.role,
												)}`}
											>
												{user.role || "N/A"}
											</span>
										</td>
										<td className="px-6 py-4">
											<span
												className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
													user.status,
												)}`}
											>
												{user.status || "N/A"}
											</span>
										</td>
										<td className="px-6 py-4 text-center">
											<button
												className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
												onClick={() =>
													navigate(
														`/admin/users/${user.user_id}/edit`,
													)
												}
											>
												<Edit2 className="w-4 h-4" />
												Edit
											</button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan="5"
										className="px-6 py-12 text-center"
									>
										<div className="flex flex-col items-center justify-center">
											<UsersIcon className="w-12 h-12 text-slate-300 mb-3" />
											<p className="text-slate-500 font-medium">
												No users found
											</p>
										</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
					<div className="flex items-center gap-4">
						<span className="text-sm text-slate-600">
							Showing{" "}
							<span className="font-semibold">
								{paginatedUsers.length > 0
									? (currentPage - 1) * itemsPerPage + 1
									: 0}
							</span>
							-
							<span className="font-semibold">
								{Math.min(
									currentPage * itemsPerPage,
									filteredUsers.length,
								)}
							</span>
							of{" "}
							<span className="font-semibold">
								{filteredUsers.length}
							</span>
						</span>

						<select
							value={itemsPerPage}
							onChange={(e) => {
								setItemsPerPage(Number(e.target.value));
								setCurrentPage(1);
							}}
							className="px-3 py-1 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value={6}>6 per page</option>
							<option value={12}>12 per page</option>
							<option value={24}>24 per page</option>
							<option value={50}>50 per page</option>
						</select>
					</div>

					<div className="flex items-center gap-1">
						<button
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
							className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>

						{visiblePages.map((page) => (
							<button
								key={page}
								onClick={() => handlePageChange(page)}
								className={`px-3 py-1 rounded-lg font-medium transition-all ${
									page === currentPage
										? "bg-blue-600 text-white"
										: "border border-slate-300 text-slate-600 hover:bg-slate-100"
								}`}
							>
								{page}
							</button>
						))}

						<button
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>
		</>
	);
};
export default UserTable;
