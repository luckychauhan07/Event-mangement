import { Shield, UserCheck, UsersIcon, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserHeader = ({ allUsers }) => {
	const navigate = useNavigate();
	const pendingRequests = allUsers.filter(
		(u) => u.status?.toLowerCase() === "pending",
	).length;

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
		<>
			<div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
				<div>
					<h1 className="text-4xl font-bold text-slate-900 mb-2">
						Users Management
					</h1>
					<p className="text-slate-600">
						Manage and monitor all users in your system
					</p>
				</div>
				<div>
					<button
						onClick={() => navigate("/admin/teacher-approvals")}
						className="group inline-flex items-center gap-3 px-5 py-2.5 rounded-xl 
							bg-gradient-to-r from-amber-500 to-orange-500 
							text-white font-semibold shadow-md 
							hover:shadow-xl hover:-translate-y-0.5 
							transition-all duration-200"
					>
						{/* Label */}
						<span className="tracking-wide">Pending Requests</span>

						{/* Badge */}
						<span
							className="min-w-[26px] h-[26px] px-2 flex items-center justify-center 
							bg-white/20 backdrop-blur rounded-full 
							text-sm font-bold 
							group-hover:scale-110 transition"
						>
							{pendingRequests}
						</span>
					</button>
				</div>
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
		</>
	);
};

export default UserHeader;
