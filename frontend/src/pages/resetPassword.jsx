import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authServices";
import toast from "react-hot-toast";

const ResetPassword = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [email, setEmail] = useState(location.state?.email || "");
	const [otp, setOtp] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");

		if (!email.trim() || otp.length !== 6) {
			setError("Enter your email and the 6-digit reset OTP.");
			return;
		}
		if (password.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setLoading(true);
		try {
			const response = await resetPassword({
				email: email.trim(),
				otp,
				newPassword: password,
			});
			toast.success(response.message || "Password reset successfully.");
			navigate("/");
		} catch (err) {
			setError(
				err.response?.data?.message ||
					"Unable to reset your password. Check the OTP and try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col">
			<header className="bg-white/80 backdrop-blur border-b shadow-sm">
				<div className="max-w-6xl mx-auto w-full flex items-center justify-between px-6 py-3">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-blue-600 text-white font-bold flex items-center justify-center rounded-xl shadow">
							EE
						</div>
						<div>
							<div className="font-semibold text-slate-800">
								Event Ease
							</div>
							<div className="text-xs text-slate-500">
								Campus Event Management
							</div>
						</div>
					</div>
					<Link
						to="/"
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow"
					>
						Log in
					</Link>
				</div>
			</header>

			<main className="flex-1 flex items-center justify-center px-6 py-12">
				<div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
					<div className="text-center mb-8">
						<div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl">
							🔒
						</div>
						<h1 className="text-3xl font-bold text-slate-900">
							Set a new password
						</h1>
						<p className="mt-3 text-sm leading-relaxed text-slate-600">
							Enter the OTP from your email and choose a new
							password.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label
								htmlFor="reset-email"
								className="text-sm font-medium text-slate-700"
							>
								Email
							</label>
							<input
								id="reset-email"
								type="email"
								value={email}
								onChange={(event) =>
									setEmail(event.target.value)
								}
								required
								className="w-full mt-1 border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
								placeholder="you@college.edu"
							/>
						</div>
						<div>
							<label
								htmlFor="reset-otp"
								className="text-sm font-medium text-slate-700"
							>
								Reset OTP
							</label>
							<input
								id="reset-otp"
								type="text"
								inputMode="numeric"
								autoComplete="one-time-code"
								value={otp}
								onChange={(event) =>
									setOtp(
										event.target.value
											.replace(/\D/g, "")
											.slice(0, 6),
									)
								}
								maxLength={6}
								required
								className="w-full mt-1 border border-slate-300 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
								placeholder="000000"
							/>
						</div>
						<div>
							<label
								htmlFor="new-password"
								className="text-sm font-medium text-slate-700"
							>
								New password
							</label>
							<input
								id="new-password"
								type="password"
								value={password}
								onChange={(event) =>
									setPassword(event.target.value)
								}
								minLength={8}
								required
								className="w-full mt-1 border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
								placeholder="At least 8 characters"
							/>
						</div>
						<div>
							<label
								htmlFor="confirm-password"
								className="text-sm font-medium text-slate-700"
							>
								Confirm new password
							</label>
							<input
								id="confirm-password"
								type="password"
								value={confirmPassword}
								onChange={(event) =>
									setConfirmPassword(event.target.value)
								}
								minLength={8}
								required
								className="w-full mt-1 border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
								placeholder="Re-enter your password"
							/>
						</div>

						{error && (
							<div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition shadow-md disabled:opacity-60"
						>
							{loading ? "Updating..." : "Update password"}
						</button>
					</form>

					<p className="text-center text-sm text-slate-500 mt-6">
						Need a new OTP?{" "}
						<Link
							to="/forgot-password"
							className="text-blue-600 font-semibold hover:underline"
						>
							Request another
						</Link>
					</p>
				</div>
			</main>
		</div>
	);
};

export default ResetPassword;
