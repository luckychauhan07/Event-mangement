import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authServices";

const Register = () => {
	const navigate = useNavigate();

	const [form, setForm] = useState({
		full_name: "",
		email: "",
		password: "",
		role: "student",
		phone: "",
	});

	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await registerUser(form);

			navigate("/");
		} catch (err) {
			setError(
				err.response?.data?.message ||
					"Registration failed. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-100 flex flex-col">
			{/* Topbar */}
			<header className="bg-white border-b shadow-sm">
				<div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-blue-600 text-white font-bold flex items-center justify-center rounded-lg">
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
						className="px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
					>
						Log in
					</Link>
				</div>
			</header>

			{/* Main content */}
			<main className="flex-1 flex items-center justify-center px-6 py-10">
				<div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl p-10 grid md:grid-cols-2 gap-10">
					{/* Left Intro */}
					<div>
						<h2 className="text-3xl font-bold text-slate-800 mb-4">
							Create your account
						</h2>

						<p className="text-slate-600 leading-relaxed">
							Join Event Ease to explore and participate in campus
							events. Students can register instantly while
							teacher accounts require admin approval before
							activation.
						</p>

						<div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5">
							<h4 className="font-semibold text-slate-800 mb-3">
								Account Benefits
							</h4>

							<ul className="text-sm text-slate-600 space-y-2">
								<li>
									✔ Discover and register for campus events
								</li>
								<li>✔ Manage event participation</li>
								<li>✔ Get notifications and updates</li>
								<li>✔ Track your event activity</li>
							</ul>
						</div>
					</div>

					{/* Right Form */}
					<div className="border rounded-xl p-6">
						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Full Name */}
							<div>
								<label className="text-sm font-medium text-slate-700">
									Full Name
								</label>
								<input
									type="text"
									className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
									placeholder="John Doe"
									onChange={(e) =>
										setForm({
											...form,
											full_name: e.target.value,
										})
									}
								/>
							</div>

							{/* Email */}
							<div>
								<label className="text-sm font-medium text-slate-700">
									Email
								</label>
								<input
									type="email"
									className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
									placeholder="you@college.edu"
									onChange={(e) =>
										setForm({
											...form,
											email: e.target.value,
										})
									}
								/>
							</div>
							{/* Phone (Optional) */}
							<div>
								<label className="text-sm font-medium text-slate-700">
									Phone Number{" "}
									<span className="text-slate-400">
										(optional)
									</span>
								</label>

								<input
									type="tel"
									className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
									placeholder="+91 98XXXXXXXX"
									onChange={(e) =>
										setForm({
											...form,
											phone: e.target.value,
										})
									}
								/>
							</div>
							{/* Password */}
							<div>
								<label className="text-sm font-medium text-slate-700">
									Password
								</label>
								<input
									type="password"
									className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
									placeholder="Create a password"
									onChange={(e) =>
										setForm({
											...form,
											password: e.target.value,
										})
									}
								/>
							</div>

							{/* Role */}
							<div>
								<label className="text-sm font-medium text-slate-700">
									Account Type
								</label>

								<select
									className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
									onChange={(e) =>
										setForm({
											...form,
											role: e.target.value,
										})
									}
								>
									<option value="student">Student</option>
									<option value="teacher">Teacher</option>
								</select>
							</div>

							{form.role === "teacher" && (
								<p className="text-xs text-amber-600">
									Teacher accounts require admin approval
									before login.
								</p>
							)}

							{/* Error */}
							{error && (
								<div className="text-red-500 text-sm">
									{error}
								</div>
							)}

							{/* Button */}
							<button
								type="submit"
								disabled={loading}
								className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
							>
								{loading
									? "Creating account..."
									: "Create Account"}
							</button>
						</form>

						{/* Footer */}
						<div className="text-center text-sm text-slate-500 mt-6">
							Already have an account?
							<Link
								to="/"
								className="ml-1 text-blue-600 font-semibold hover:underline"
							>
								Log in
							</Link>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Register;
