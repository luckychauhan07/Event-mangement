import {
	ArrowUpRight,
	ChevronLeft,
	ChevronRight,
	Mail,
	UsersIcon,
	View,
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
		const normalizedRole = role?.trim().toLowerCase();

		const roleStyles = {
			admin: "bg-red-50 text-red-700 border border-red-200 shadow-sm shadow-red-100/50",
			teacher:
				"bg-blue-50 text-blue-700 border border-blue-200 shadow-sm shadow-blue-100/50",
			student:
				"bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm shadow-emerald-100/50",
			participant:
				"bg-violet-50 text-violet-700 border border-violet-200 shadow-sm shadow-violet-100/50",
		};

		return (
			roleStyles[normalizedRole] ||
			"bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
		);
	};

	const getStatusColor = (status) => {
		const normalizedStatus = status?.trim().toLowerCase();

		const statusStyles = {
			active: "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm shadow-emerald-100/50",
			inactive:
				"bg-slate-100 text-slate-600 border border-slate-200 shadow-sm shadow-slate-100/50",
			pending:
				"bg-amber-50 text-amber-700 border border-amber-200 shadow-sm shadow-amber-100/50",
			blocked:
				"bg-rose-50 text-rose-700 border border-rose-200 shadow-sm shadow-rose-100/50",
			rejected:
				"bg-pink-50 text-pink-700 border border-pink-200 shadow-sm shadow-pink-100/50",
		};

		return (
			statusStyles[normalizedStatus] ||
			"bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
		);
	};

	return (
		<div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead className="bg-gradient-to-r from-slate-50 via-white to-slate-100 border-b border-slate-200">
						<tr>
							<th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
								Name
							</th>
							<th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
								Email
							</th>
							<th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
								Role
							</th>
							<th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
								Status
							</th>
							<th className="text-center px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
								Actions
							</th>
						</tr>
					</thead>

					<tbody className="divide-y divide-slate-100">
						{paginatedUsers.length > 0 ? (
							paginatedUsers.map((user) => (
								<tr
									key={user.user_id}
									className="group transition-all duration-200 hover:bg-slate-50/80"
								>
									<td className="px-6 py-4">
										<div className="flex items-center gap-3">
											<div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold text-sm shadow-md ring-2 ring-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
												{user.full_name
													?.charAt(0)
													?.toUpperCase() || "U"}
											</div>

											<div>
												<p className="font-semibold text-slate-900 transition-colors duration-200 group-hover:text-slate-950">
													{user.full_name || "N/A"}
												</p>
												<p className="text-xs text-slate-400">
													ID: #{user.user_id}
												</p>
											</div>
										</div>
									</td>

									<td className="px-6 py-4">
										<div className="flex items-center gap-2 text-slate-600 transition-all duration-200 group-hover:text-slate-800">
											<div className="p-2 rounded-lg bg-slate-100 text-slate-500 transition-all duration-200 group-hover:bg-indigo-50 group-hover:text-indigo-600">
												<Mail className="w-4 h-4" />
											</div>
											<span className="truncate max-w-[240px]">
												{user.email || "N/A"}
											</span>
										</div>
									</td>

									<td className="px-6 py-4">
										<span
											className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 group-hover:scale-[1.03] ${getRoleColor(
												user.role,
											)}`}
										>
											<span className="w-2 h-2 rounded-full bg-current opacity-70"></span>
											{user.role || "N/A"}
										</span>
									</td>

									<td className="px-6 py-4">
										<span
											className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 group-hover:scale-[1.03] ${getStatusColor(
												user.status,
											)}`}
										>
											<span className="w-2 h-2 rounded-full bg-current opacity-70"></span>
											{user.status || "N/A"}
										</span>
									</td>

									<td className="px-6 py-4 text-center">
										<button
											onClick={() =>
												navigate(
													`/admin/users/${user.user_id}`,
												)
											}
											className="group/btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium shadow-sm hover:shadow-md hover:border-indigo-200 hover:bg-indigo-50/70 hover:text-indigo-700 active:scale-[0.98] transition-all duration-200"
										>
											<span>View Profile</span>
											<span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-500 group-hover/btn:bg-indigo-100 group-hover/btn:text-indigo-600 transition-all duration-200">
												<ArrowUpRight className="w-4 h-4" />
											</span>
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan="5"
									className="px-6 py-14 text-center"
								>
									<div className="flex flex-col items-center justify-center">
										<div className="p-4 rounded-2xl bg-slate-100 mb-4">
											<UsersIcon className="w-10 h-10 text-slate-400" />
										</div>
										<p className="text-slate-700 font-semibold text-base">
											No users found
										</p>
										<p className="text-slate-500 text-sm mt-1">
											Try changing filters or search
											query.
										</p>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="px-6 py-4 bg-gradient-to-r from-white via-slate-50 to-white border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
				<div className="flex items-center gap-4 flex-wrap">
					<span className="text-sm text-slate-600">
						Showing{" "}
						<span className="font-semibold text-slate-900">
							{paginatedUsers.length > 0
								? (currentPage - 1) * itemsPerPage + 1
								: 0}
						</span>
						-
						<span className="font-semibold text-slate-900">
							{Math.min(
								currentPage * itemsPerPage,
								filteredUsers.length,
							)}
						</span>{" "}
						of{" "}
						<span className="font-semibold text-slate-900">
							{filteredUsers.length}
						</span>
					</span>

					<select
						value={itemsPerPage}
						onChange={(e) => {
							setItemsPerPage(Number(e.target.value));
							setCurrentPage(1);
						}}
						className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200"
					>
						<option value={6}>6 per page</option>
						<option value={12}>12 per page</option>
						<option value={24}>24 per page</option>
						<option value={50}>50 per page</option>
					</select>
				</div>

				<div className="flex items-center gap-2">
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
					>
						<ChevronLeft className="w-4 h-4" />
					</button>

					{visiblePages.map((page) => (
						<button
							key={page}
							onClick={() => handlePageChange(page)}
							className={`min-w-[40px] h-10 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
								page === currentPage
									? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200/60 scale-105"
									: "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:scale-105"
							}`}
						>
							{page}
						</button>
					))}

					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
					>
						<ChevronRight className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
};

export default UserTable;
