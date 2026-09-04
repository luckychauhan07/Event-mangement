import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resendOtp, verifyOtp } from "../services/authServices";
import toast from "react-hot-toast";

const VerifyOtp = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [email, setEmail] = useState(location.state?.email || "");
	const [otp, setOtp] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");

		if (!email.trim() || otp.length !== 6) {
			setError("Enter your email and the 6-digit verification code.");
			return;
		}

		setLoading(true);
		try {
			await verifyOtp({ email: email.trim(), otp });
			navigate("/", {
				state: { message: "Email verified. You can now log in." },
			});
		} catch (err) {
			toast.error(
				err.response?.data?.message ||
					"Verification failed. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	};
	const handleResendOtp = async (email) => {
		try {
			await resendOtp(email);
			toast.success("OTP resent successfully. Please check your email.");
		} catch (err) {
			toast.error(
				err.response?.data?.message ||
					"Failed to resend OTP. Please try again.",
			);
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
							✉
						</div>
						<h1 className="text-3xl font-bold text-slate-900">
							Verify your email
						</h1>
						<p className="mt-3 text-sm leading-relaxed text-slate-600">
							Enter the 6-digit code sent to your email to
							activate your Event Ease account.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label
								htmlFor="verification-email"
								className="text-sm font-medium text-slate-700"
							>
								Email
							</label>
							<input
								id="verification-email"
								type="email"
								value={email}
								onChange={(event) =>
									setEmail(event.target.value)
								}
								className="w-full mt-1 border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
								placeholder="you@college.edu"
								required
							/>
						</div>
						<div>
							<label
								htmlFor="verification-code"
								className="text-sm font-medium text-slate-700"
							>
								Verification code
							</label>
							<input
								id="verification-code"
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
								className="w-full mt-1 border border-slate-300 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
								placeholder="000000"
								maxLength={6}
								required
							/>
						</div>
						<button
							className="text-sm text-blue-600 font-semibold hover:underline"
							onClick={() => handleResendOtp(email)}
						>
							resend otp
						</button>

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
							{loading ? "Verifying..." : "Verify email"}
						</button>
					</form>

					<p className="text-center text-sm text-slate-500 mt-6">
						Need to use a different account?{" "}
						<Link
							to="/signup"
							className="text-blue-600 font-semibold hover:underline"
						>
							Sign up
						</Link>
					</p>
				</div>
			</main>
		</div>
	);
};

export default VerifyOtp;
