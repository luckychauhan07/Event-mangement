import { getUserDetails, updateUserDetails } from "@/services/userServices";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const EditUser = () => {
	const [userDetails, setUserDetails] = useState({
		full_name: "",
		email: "",
		phone: "",
		role: "user",
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	const { id } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchUserDetails = async (id) => {
			try {
				setLoading(true);
				const userDetails = await getUserDetails(id);
				setUserDetails(userDetails.data);
			} catch (error) {
				const errMsg = error.response?.data?.message;
				console.error("Error fetching user details:", errMsg || error);
				setError(errMsg || "Failed to fetch user details");
				toast.error(errMsg || "Failed to fetch user details");
			} finally {
				setLoading(false);
			}
		};
		fetchUserDetails(id);
	}, [id]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			await updateUserDetails(id, userDetails);
			toast.success("User updated successfully");
			navigate("/admin/users");
		} catch (err) {
			const message =
				err.response?.data?.message || "Something went wrong";
			toast.error(message);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="p-6 md:p-8 bg-slate-50 min-h-full">
				<div className="max-w-2xl mx-auto">
					<div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5 animate-pulse">
						<div className="h-8 w-48 bg-slate-200 rounded-lg" />
						<div className="space-y-4">
							<div className="h-12 bg-slate-100 rounded-lg" />
							<div className="h-12 bg-slate-100 rounded-lg" />
							<div className="h-12 bg-slate-100 rounded-lg" />
							<div className="h-12 bg-slate-100 rounded-lg" />
						</div>
						<div className="h-10 w-32 bg-slate-200 rounded-lg" />
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 md:p-8 bg-slate-50 min-h-full flex items-center justify-center">
				<div className="max-w-2xl w-full">
					<div className="bg-white border border-red-200 rounded-2xl shadow-md p-8">
						<div className="flex flex-col items-center text-center space-y-4">
							<div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
								<span className="text-2xl">⚠️</span>
							</div>
							<div>
								<h2 className="text-2xl font-bold text-red-700">
									Failed to load user
								</h2>
								<p className="text-sm text-slate-600 mt-2">
									{error}
								</p>
							</div>
							<button
								onClick={() => navigate("/admin/users")}
								className="mt-6 px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 hover:shadow-sm transition-all duration-200 font-medium"
							>
								Back to Users
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
	if (
		userDetails.status === "pending" ||
		userDetails.status === "rejected" ||
		userDetails.status === "inactive"
	) {
		const statusConfig = {
			pending: {
				icon: "⏳",
				color: "amber",
				message:
					"This user account is pending approval and cannot be edited until activated.",
			},
			inactive: {
				icon: "🔒",
				color: "orange",
				message:
					"This user account is inactive. Please activate it before making any edits.",
			},
			rejected: {
				icon: "❌",
				color: "red",
				message:
					"This user account has been rejected and cannot be edited.",
			},
		};
		const config = statusConfig[userDetails.status];
		const borderColor =
			config.color === "amber"
				? "border-amber-200"
				: config.color === "orange"
					? "border-orange-200"
					: "border-red-200";
		const bgColor =
			config.color === "amber"
				? "bg-amber-50"
				: config.color === "orange"
					? "bg-orange-50"
					: "bg-red-50";
		const textColor =
			config.color === "amber"
				? "text-amber-700"
				: config.color === "orange"
					? "text-orange-700"
					: "text-red-700";
		const iconBgColor =
			config.color === "amber"
				? "bg-amber-100"
				: config.color === "orange"
					? "bg-orange-100"
					: "bg-red-100";

		return (
			<div className="p-6 md:p-8 bg-slate-50 min-h-full flex items-center justify-center">
				<div className="max-w-2xl w-full">
					<div
						className={`bg-white border rounded-2xl shadow-md p-8 ${borderColor}`}
					>
						<div className="flex flex-col items-center text-center space-y-4">
							<div
								className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center`}
							>
								<span className="text-2xl">{config.icon}</span>
							</div>
							<div>
								<h2
									className={`text-2xl font-bold ${textColor} capitalize`}
								>
									{userDetails.status} Account
								</h2>
								<p className="text-sm text-slate-600 mt-2">
									{config.message}
								</p>
							</div>
							<button
								onClick={() => navigate("/admin/users")}
								className="mt-6 px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 hover:shadow-sm transition-all duration-200 font-medium"
							>
								Back to Users
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 md:p-8 bg-slate-50 min-h-full">
			<div className="max-w-2xl mx-auto space-y-5">
				<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 flex items-start justify-between gap-4">
					<div className="space-y-1">
						<h1 className="text-3xl font-bold text-slate-900 tracking-tight">
							Edit User
						</h1>
						<p className="text-sm text-slate-600 mt-1">
							Update user profile and settings.
						</p>
					</div>
					<button
						className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all duration-200 text-sm font-medium"
						onClick={() => window.history.back()}
					>
						<span>←</span>
						<span>Back</span>
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
						<div>
							<label
								htmlFor="full_name"
								className="block text-sm font-semibold text-slate-700 mb-2"
							>
								Full Name
							</label>
							<input
								type="text"
								id="full_name"
								name="full_name"
								value={userDetails.full_name}
								onChange={(e) =>
									setUserDetails({
										...userDetails,
										full_name: e.target.value,
									})
								}
								className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
								placeholder="Enter full name"
								disabled={submitting}
							/>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-semibold text-slate-700 mb-2"
							>
								Email Address
							</label>
							<input
								type="email"
								id="email"
								name="email"
								value={userDetails.email}
								onChange={(e) =>
									setUserDetails({
										...userDetails,
										email: e.target.value,
									})
								}
								className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
								placeholder="Enter email address"
								disabled={submitting}
							/>
						</div>

						<div>
							<label
								htmlFor="phone"
								className="block text-sm font-semibold text-slate-700 mb-2"
							>
								Phone Number
							</label>
							<input
								type="text"
								id="phone"
								name="phone"
								value={userDetails.phone}
								onChange={(e) =>
									setUserDetails({
										...userDetails,
										phone: e.target.value,
									})
								}
								className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
								placeholder="Enter phone number"
								disabled={submitting}
							/>
						</div>

						<div>
							<label
								htmlFor="role"
								className="block text-sm font-semibold text-slate-700 mb-2"
							>
								Role
								{userDetails.role === "admin" && (
									<span className="ml-2 text-xs font-normal text-slate-500">
										(Protected)
									</span>
								)}
							</label>
							{userDetails.role === "admin" ? (
								<>
									<div className="w-full px-4 py-3 rounded-lg border border-purple-200 bg-purple-50 flex items-center gap-3">
										<span className="text-lg">🔒</span>
										<div>
											<p className="text-sm font-semibold text-purple-900">
												Admin
											</p>
											<p className="text-xs text-purple-700">
												This is a system administrator
												account
											</p>
										</div>
									</div>
									<div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3">
										<p className="text-xs font-medium text-amber-900 flex items-start gap-2">
											<span>⚠️</span>
											<span>
												Admin roles are protected and
												cannot be changed. Contact your
												system administrator if you need
												to modify this account.
											</span>
										</p>
									</div>
								</>
							) : (
								<select
									id="role"
									name="role"
									value={userDetails.role}
									onChange={(e) =>
										setUserDetails({
											...userDetails,
											role: e.target.value,
										})
									}
									className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
									disabled={submitting}
								>
									<option value="" disabled>
										Select a role
									</option>
									<option value="user">User</option>
									<option value="teacher">Teacher</option>
									{/* <option value="admin">Admin</option> */}
								</select>
							)}
						</div>
					</div>
					<div>
						<p className="text-xs text-slate-500 mt-2">
							The status of the user account (Active, Inactive,
							Pending) can only be changed from the user details
							page.
						</p>
					</div>

					<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 mt-5 flex gap-3">
						<button
							type="submit"
							disabled={submitting}
							className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 hover:shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200"
						>
							{submitting ? "Saving..." : "Save Changes"}
						</button>
						<button
							type="button"
							onClick={() => navigate("/admin/users")}
							disabled={submitting}
							className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all duration-200"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditUser;
