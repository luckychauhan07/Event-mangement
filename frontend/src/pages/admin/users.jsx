import { getAllUsers } from "@/services/userServices";
import { useEffect, useState, useMemo } from "react";
import {
	Search,
	SlidersHorizontal,
	Users as UsersIcon,
	
} from "lucide-react";
import UserHeader from "@/components/admin/user/userHeader";
import UserTable from "@/components/admin/user/userTable";

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

	

	return (
		<div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<UserHeader allUsers={allUsers} />
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
				<UserTable
					paginatedUsers={paginatedUsers}
					currentPage={currentPage}
					totalPages={totalPages}
					handlePageChange={handlePageChange}
					itemsPerPage={itemsPerPage}
					setItemsPerPage={setItemsPerPage}
					filteredUsers={filteredUsers}
					visiblePages={visiblePages}
				/>
			</div>
		</div>
	);
};

export default Users;
