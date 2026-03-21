import { getAllUsers } from "@/services/userServices";
import { useEffect, useState, useMemo } from "react";
import {
	Search,
	SlidersHorizontal,
	Users as UsersIcon,
	UserCheck,
	UserX,
	ChevronLeft,
	ChevronRight,
	Edit2,
	Mail,
	Shield,
} from "lucide-react";

const Users = () => {
	const [allUsers, setAllUsers] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(12);

	useEffect(() => {
		document.title = "Admin - Users";
		const fetchUsers = async () => {
			try {
				const response = await getAllUsers();
				console.log("Fetched users:", response);
				setAllUsers(response.data || []);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};
		fetchUsers();
	}, []);

	// Extract unique roles and statuses from users
	const roleOptions = useMemo(() => {
		const roles = [...new Set(allUsers.map((u) => u.role).filter(Boolean))];
		return roles;
	}, [allUsers]);

	const statusOptions = useMemo(() => {
		const statuses = [
			...new Set(allUsers.map((u) => u.status).filter(Boolean)),
		];
		return statuses;
	}, [allUsers]);

	// Filter and search logic
	const filteredUsers = useMemo(() => {
		return allUsers.filter((user) => {
			const matchSearch =
				!searchTerm ||
				user.full_name
					?.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				user.email?.toLowerCase().includes(searchTerm.toLowerCase());

			const matchRole = roleFilter === "all" || user.role === roleFilter;
			const matchStatus =
				statusFilter === "all" || user.status === statusFilter;

			return matchSearch && matchRole && matchStatus;
		});
	}, [allUsers, searchTerm, roleFilter, statusFilter]);

	// Pagination
	const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
	const paginatedUsers = useMemo(() => {
		const startIdx = (currentPage - 1) * itemsPerPage;
		return filteredUsers.slice(startIdx, startIdx + itemsPerPage);
	}, [filteredUsers, currentPage, itemsPerPage]);

	const handlePageChange = (page) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	};

	// Visible page numbers (sliding window of 5)
	const visiblePages = useMemo(() => {
		const maxVisible = 5;
		let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
		let end = Math.min(totalPages, start + maxVisible - 1);
		if (end - start < maxVisible - 1) {
			start = Math.max(1, end - maxVisible + 1);
		}
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}, [currentPage, totalPages]);

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

	const StatCard = ({ icon: Icon, label, value, color }) => (
		<div className="bg-white rounded-lg shadow-md p-5 border border-slate-200 hover:shadow-lg transition-shadow">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-slate-600 font-medium">
						{label}
					</p>
					<p className="text-3xl font-bold text-slate-900 mt-1">
						{value}
					</p>
				</div>
				<div className={`p-3 rounded-lg ${color}`}>
					<Icon className="w-6 h-6" />
				</div>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-slate-900 mb-2">
						Users Management
					</h1>
					<p className="text-slate-600">
						Manage and monitor all users in your system
					</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
					<StatCard
						icon={UsersIcon}
						label="Total Users"
						value={allUsers.length}
						color="bg-blue-100 text-blue-600"
					/>
					<StatCard
						icon={UserCheck}
						label="Active Users"
						value={
							allUsers.filter(
								(u) => u.status?.toLowerCase() === "active",
							).length
						}
						color="bg-green-100 text-green-600"
					/>
					<StatCard
						icon={UserX}
						label="Inactive Users"
						value={
							allUsers.filter(
								(u) => u.status?.toLowerCase() === "inactive",
							).length
						}
						color="bg-slate-100 text-slate-600"
					/>
					<StatCard
						icon={Shield}
						label="Admins"
						value={
							allUsers.filter(
								(u) => u.role?.toLowerCase() === "admin",
							).length
						}
						color="bg-red-100 text-red-600"
					/>
				</div>

				{/* Search & Filters */}
				<div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-8">
					<div className="flex items-center gap-3 mb-5">
						<SlidersHorizontal className="w-5 h-5 text-slate-600" />
						<h3 className="text-lg font-semibold text-slate-900">
							Search & Filter
						</h3>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						{/* Search Bar */}
						<div className="md:col-span-2">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
								<input
									type="text"
									placeholder="Search by name or email..."
									value={searchTerm}
									onChange={(e) => {
										setSearchTerm(e.target.value);
										setCurrentPage(1);
									}}
									className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
								/>
							</div>
						</div>

						{/* Role Filter */}
						<div>
							<select
								value={roleFilter}
								onChange={(e) => {
									setRoleFilter(e.target.value);
									setCurrentPage(1);
								}}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
							>
								<option value="all">All Roles</option>
								{roleOptions.map((role) => (
									<option key={role} value={role}>
										{role}
									</option>
								))}
							</select>
						</div>

						{/* Status Filter */}
						<div>
							<select
								value={statusFilter}
								onChange={(e) => {
									setStatusFilter(e.target.value);
									setCurrentPage(1);
								}}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
							>
								<option value="all">All Status</option>
								{statusOptions.map((status) => (
									<option key={status} value={status}>
										{status}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{/* Users Table */}
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
												<button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
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
								onClick={() =>
									handlePageChange(currentPage - 1)
								}
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
								onClick={() =>
									handlePageChange(currentPage + 1)
								}
								disabled={currentPage === totalPages}
								className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Users;
