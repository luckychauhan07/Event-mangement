import {
	changeUserStatus,
	deleteUser,
	getUserDetails,
} from "@/services/userServices";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const UserDetails = () => {
	const [userDetails, setUserDetails] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { id } = useParams();
	const navigate = useNavigate();
	useEffect(() => {
		const fetchUserDetails = async (id) => {
			try {
				setLoading(true);

				const userDetails = await getUserDetails(id);

				setUserDetails(userDetails.data);
			} catch (error) {
				console.error("Error fetching user details:", error);
				setError(error);
			} finally {
				setLoading(false);
			}
		};
		fetchUserDetails(id);
	}, [id]);
	const handleUsersActions = async (id, action) => {
		try {
			if (action === "delete") {
				await deleteUser(id);
				toast.success("User deleted successfully");
				navigate("/admin/users");
			} else if (action === "deactivate") {
				const result = await changeUserStatus(id, "deactivate");
				if (result.success) {
					toast.success("User deactivated successfully");
					navigate("/admin/users");
				} else {
					console.error("Failed to deactivate user:", result.message);
					toast.error(result.message || "Failed to deactivate user");
				}
			} else if (action === "activate") {
				const result = await changeUserStatus(id, "activate");
				if (result.success) {
					toast.success("User activated successfully");
					navigate("/admin/users");
				} else {
					console.error("Failed to activate user:", result.message);
					toast.error(result.message || "Failed to activate user");
				}
			}
		} catch (err) {
			const message =
				err.response?.data?.message || "Something went wrong";

			toast.error(message);
		}
	};
	const status = userDetails?.status || "unknown";
	const role = userDetails?.role || "-";
	const statusClassName = (() => {
		switch (status) {
			case "active":
				return "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm shadow-emerald-100/50";
			case "inactive":
				return "bg-slate-100 text-slate-600 border border-slate-200 shadow-sm shadow-slate-100/50";
			case "pending":
				return "bg-amber-50 text-amber-700 border border-amber-200 shadow-sm shadow-amber-100/50";
			case "blocked":
				return "bg-rose-50 text-rose-700 border border-rose-200 shadow-sm shadow-rose-100/50";
			case "rejected":
				return "bg-pink-50 text-pink-700 border border-pink-200 shadow-sm shadow-pink-100/50";
			default:
				return "bg-slate-100 text-slate-700 border border-slate-200";
		}
	})();
	if (loading) {
		return (
			<div className="p-6 md:p-8 bg-slate-50 min-h-full">
				<div className="max-w-4xl mx-auto">
					<div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5 animate-pulse">
						<div className="h-8 w-48 bg-slate-200 rounded-lg" />
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="h-20 bg-slate-100 rounded-xl" />
							<div className="h-20 bg-slate-100 rounded-xl" />
							<div className="h-20 bg-slate-100 rounded-xl" />
							<div className="h-20 bg-slate-100 rounded-xl" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 md:p-8 bg-slate-50 min-h-full">
				<div className="max-w-4xl mx-auto bg-white border border-red-200 rounded-2xl shadow-sm p-6">
					<h2 className="text-xl font-bold text-red-700">
						Unable to load user details
					</h2>
					<p className="text-sm text-slate-600 mt-2">
						Please refresh the page or try again later.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 md:p-8 bg-slate-50 min-h-full">
			<div className="max-w-4xl mx-auto space-y-5">
				<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
					<div className="space-y-1">
						<h1 className="text-3xl font-bold text-slate-900 tracking-tight">
							User Details
						</h1>
						<p className="text-sm text-slate-600 mt-1">
							Detailed profile and account status overview.
						</p>
					</div>
					<div className="flex items-center gap-3">
						<button
							className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all duration-200 text-sm font-medium"
							onClick={() => window.history.back()}
						>
							<span>←</span>
							<span>Back</span>
						</button>
						<span
							className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border capitalize ${statusClassName}`}
						>
							{status}
						</span>
					</div>
				</div>

				<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:border-slate-300 hover:bg-white">
							<p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
								Full Name
							</p>
							<p className="text-sm md:text-base font-semibold text-slate-800 mt-1">
								{userDetails?.full_name || "-"}
							</p>
						</div>

						<div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:border-slate-300 hover:bg-white">
							<p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
								Email
							</p>
							<p className="text-sm md:text-base font-semibold text-slate-800 mt-1 break-all">
								{userDetails?.email || "-"}
							</p>
						</div>

						<div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:border-slate-300 hover:bg-white">
							<p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
								Phone
							</p>
							<p className="text-sm md:text-base font-semibold text-slate-800 mt-1">
								{userDetails?.phone || "-"}
							</p>
						</div>

						<div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:border-slate-300 hover:bg-white">
							<p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
								Role
							</p>
							<p className="text-sm md:text-base font-semibold text-slate-800 mt-1 capitalize">
								{role}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5">
					<p className="text-sm text-slate-600 mb-3">Quick Actions</p>
					<div className="flex flex-wrap gap-2">
						{userDetails.status !== "active" && (
							<button
								className="px-4 py-2 rounded-lg border border-red-300 text-red-700 bg-white hover:bg-red-50 hover:shadow-sm transition-all duration-200 font-medium"
								onClick={() =>
									handleUsersActions(
										userDetails.user_id,
										"delete",
									)
								}
							>
								Delete User
							</button>
						)}
						<button
							className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md transition-all duration-200 font-medium"
							onClick={() =>
								navigate(
									`/admin/users/${userDetails.user_id}/edit`,
								)
							}
						>
							Edit User
						</button>

						{userDetails.status === "active" && (
							<button
								className="px-4 py-2 rounded-lg border border-amber-300 text-amber-700 bg-white hover:bg-amber-50 hover:shadow-sm transition-all duration-200 font-medium"
								onClick={() =>
									handleUsersActions(
										userDetails.user_id,
										"deactivate",
									)
								}
							>
								Deactivate User
							</button>
						)}

						{userDetails.status === "inactive" && (
							<button
								className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 hover:shadow-sm transition-all duration-200 font-medium"
								onClick={() =>
									handleUsersActions(
										userDetails.user_id,
										"activate",
									)
								}
							>
								Activate User
							</button>
						)}
					</div>
					<div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 p-4">
						<div className="flex items-start gap-2">
							<span className="text-blue-700 text-sm leading-5">
								ℹ️
							</span>
							<div>
								<p className="text-sm font-semibold text-blue-900">
									How to delete a user?
								</p>
								<p className="mt-1 text-xs leading-5 text-blue-800">
									To delete a user, you must first deactivate
									their account. Once the user is deactivated,
									the option to delete will become available.
								</p>
								<p className="mt-1 text-xs leading-5 text-blue-800">
									Active users cannot be deleted directly for
									security reasons. Click "Deactivate User"
									first, then proceed with deletion.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserDetails;
