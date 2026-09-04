import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../services/authServices";
import toast from "react-hot-toast";

const ForgotPassword = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");
		setMessage("");
		setLoading(true);

		try {
			const response = await requestPasswordReset(email.trim());
			navigate("/reset-password", {
				state: { email: email.trim(), message: response.message },
			});
		} catch (err) {
			toast.error(
				err.response?.data?.message ||
					"Failed to send reset instructions. Please try again.",
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
							🔐
						</div>
						<h1 className="text-3xl font-bold text-slate-900">
							Forgot password?
						</h1>
						<p className="mt-3 text-sm leading-relaxed text-slate-600">
							Enter your account email and we will send
							instructions to reset your password.
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
								placeholder="you@college.edu"
								required
								className="w-full mt-1 border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
							/>
						</div>

						{error && (
							<div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
								{error}
							</div>
						)}
						{message && (
							<div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
								{message}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition shadow-md disabled:opacity-60"
						>
							{loading ? "Sending..." : "Send reset instructions"}
						</button>
					</form>

					<p className="text-center text-sm text-slate-500 mt-6">
						Remember your password?{" "}
						<Link
							to="/"
							className="text-blue-600 font-semibold hover:underline"
						>
							Back to login
						</Link>
					</p>
				</div>
			</main>
		</div>
	);
};

export default ForgotPassword;
