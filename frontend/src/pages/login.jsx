import React, { useState } from "react";
import { loginUser } from "../services/authServices";
import { Link } from "react-router-dom";

const Login = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		terms: false,
	});
	const [error, setError] = useState("");

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		console.log(name, value, type, checked);
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		// This is where you will call your backend API later!
		try {
			const response = await loginUser({
				email: formData.email,
				password: formData.password,
			});

			// store token
			localStorage.setItem("token", response.token);

			// store user info
			localStorage.setItem("user", JSON.stringify(response.user));
			console.log(response, "lucky");

			// redirect based on role
			if (response.user.role === "admin") {
				window.location.href = "/admin";
			}

			if (response.user.role === "teacher") {
				window.location.href = "/teacher/dashboard";
			}

			if (response.user.role === "student") {
				window.location.href = "/student/dashboard";
			}
		} catch (err) {
			const message =
				err.response?.data?.message ||
				"Login failed. Please try again.";

			setError(message);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-5 bg-[linear-gradient(135deg,#f8fafc_0%,#f1f5f9_100%)] relative overflow-hidden font-['Inter']">
			{/* Background Pattern */}
			<div
				className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
				style={{
					backgroundImage: `url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23000000"><path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/></g></g></svg>')`,
				}}
			/>

			<div className="w-full max-w-[460px] relative z-10">
				{/* Header */}
				<header className="text-center mb-12 animate-[fadeInDown_0.6s_ease-out]">
					<div className="flex items-center justify-center gap-4 mb-6">
						<div className="w-16 h-16 flex items-center justify-center text-white text-2xl font-bold rounded-2xl bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] shadow-[0_12px_32px_rgba(102,126,234,0.4)] animate-[logoFloat_3s_ease-in-out_infinite]">
							EE
						</div>
						<h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
							Event Ease
						</h2>
					</div>
				</header>

				{/* Login Card */}
				<main className="bg-white rounded-[28px] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] border border-slate-100 animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
					<h3 className="mb-3 text-slate-900 text-3xl font-bold tracking-tight">
						Welcome back!
					</h3>
					<p className="text-slate-500 mb-9 text-[15px] leading-relaxed">
						Sign in to continue to your account
					</p>
					{error && (
						<div className="text-red-500 text-sm mt-2">{error}</div>
					)}
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Email Field */}
						<div>
							<label
								htmlFor="email"
								className="block mb-2.5 text-slate-900 font-semibold text-sm tracking-wide"
							>
								Email address
							</label>
							<input
								type="email"
								id="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="you@college.edu"
								required
								className="w-full px-[18px] py-3.5 border-2 border-slate-200 rounded-xl text-[15px] transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:-translate-y-0.5 placeholder:text-slate-400"
							/>
						</div>

						{/* Password Field */}
						<div>
							<label
								htmlFor="password"
								className="block mb-2.5 text-slate-900 font-semibold text-sm tracking-wide"
							>
								Password
							</label>
							<input
								type="password"
								id="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="Enter your password"
								required
								className="w-full px-[18px] py-3.5 border-2 border-slate-200 rounded-xl text-[15px] transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:-translate-y-0.5 placeholder:text-slate-400"
							/>
						</div>

						{/* Terms Checkbox */}
						<div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-blue-50 to-sky-100 rounded-xl border border-blue-100">
							<input
								type="checkbox"
								id="terms"
								name="terms"
								checked={formData.terms}
								onChange={handleChange}
								required
								className="w-5 h-5 cursor-pointer accent-blue-600"
							/>
							<label
								htmlFor="terms"
								className="text-sm font-medium text-slate-900 cursor-pointer"
							>
								I agree to the terms and conditions
							</label>
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							className="group relative w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-base font-semibold shadow-[0_8px_24px_rgba(59,130,246,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(59,130,246,0.4)] active:translate-y-0 overflow-hidden"
						>
							<span className="relative z-10">Sign In</span>
							<div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
						</button>

						{/* Actions */}
						<div className="text-center pt-4">
							<div className="text-sm text-slate-500">
								Don't have an account?
								<Link
									to="/signup"
									className="inline-block ml-1 font-semibold text-blue-600 hover:text-blue-700 hover:translate-x-0.5 transition-all"
								>
									Create one
								</Link>
							</div>

							<Link
								to="/forgot-password"
								className="inline-block mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:translate-x-0.5 transition-all"
							>
								Forgot your password?
							</Link>
						</div>
					</form>
				</main>
			</div>
		</div>
	);
};

export default Login;
