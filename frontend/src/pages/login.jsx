import React, { useState } from "react";
import { loginUser } from "../services/authServices";
import { Link } from "react-router-dom";

const Login = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		terms: false,
	});

	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await loginUser({
				email: formData.email,
				password: formData.password,
			});

			localStorage.setItem("token", response.token);
			localStorage.setItem("user", JSON.stringify(response.user));

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
			setError(
				err.response?.data?.message ||
					"Login failed. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col">
			{/* Header (same as signup) */}
			<header className="bg-white/80 backdrop-blur border-b shadow-sm">
				<div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
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
						to="/signup"
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow"
					>
						Sign up
					</Link>
				</div>
			</header>

			{/* Main */}
			<main className="flex-1 flex items-center justify-center px-6 py-12">
				<div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">
					{/* LEFT SIDE (same style as signup) */}
					<div className="p-10 bg-gradient-to-br from-blue-50 to-white">
						<h2 className="text-4xl font-bold text-slate-900 mb-4">
							Welcome back 👋
						</h2>

						<p className="text-slate-600 leading-relaxed">
							Log in to access your dashboard, manage events, and
							stay updated with campus activities.
						</p>

						<div className="mt-10 bg-white border rounded-xl p-6 shadow-sm">
							<h4 className="font-semibold text-slate-800 mb-4">
								Why login?
							</h4>

							<ul className="text-sm text-slate-600 space-y-3">
								<li>📅 Manage your events</li>
								<li>🔔 Get notifications</li>
								<li>📊 Track your activity</li>
								<li>🚀 Access your dashboard</li>
							</ul>
						</div>
					</div>
					{/* RIGHT FORM */}
					<div className="p-10">
						<h3 className="text-2xl font-bold text-slate-800 mb-6">
							Sign In
						</h3>

						{error && (
							<div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
								{error}
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-5">
							{/* Email */}
							<div>
								<label className="text-sm font-medium text-slate-700">
									Email
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="you@college.edu"
									required
									className="w-full mt-1 border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
								/>
							</div>

							{/* Password with toggle */}
							<div>
								<label className="text-sm font-medium text-slate-700">
									Password
								</label>

								<div className="relative">
									<input
										type={
											showPassword ? "text" : "password"
										}
										name="password"
										value={formData.password}
										onChange={handleChange}
										placeholder="Enter your password"
										required
										className="w-full mt-1 border border-slate-300 rounded-xl px-4 py-2 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
									/>

									<button
										type="button"
										onClick={() =>
											setShowPassword(!showPassword)
										}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 font-semibold"
									>
										{showPassword ? "Hide" : "Show"}
									</button>
								</div>
							</div>

							{/* Terms */}
							<div className="flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									name="terms"
									checked={formData.terms}
									onChange={handleChange}
									required
									className="accent-blue-600"
								/>
								<span className="text-slate-600">
									I agree to terms & conditions
								</span>
							</div>

							{/* Button */}
							<button
								type="submit"
								disabled={loading}
								className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition shadow-md disabled:opacity-60"
							>
								{loading ? "Signing in..." : "Sign In"}
							</button>

							{/* Links */}
							<div className="text-center text-sm text-slate-500 mt-4">
								Don’t have an account?
								<Link
									to="/signup"
									className="ml-1 text-blue-600 font-semibold hover:underline"
								>
									Create one
								</Link>
							</div>

							<div className="text-center">
								<Link
									to="/forgot-password"
									className="text-sm text-blue-600 font-semibold hover:underline"
								>
									Forgot password?
								</Link>
							</div>
						</form>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Login;
