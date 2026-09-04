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
			const response = await registerUser(form);
			navigate("/verify", { state: { email: form.email } });
			// navigate("/");
		} catch (err) {
			console.error("Registration error:", err);
			setError(
				err.response?.data?.message ||
					"Registration failed. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient from-slate-50 via-blue-50 to-slate-100 flex flex-col">
			{/* Topbar */}
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
						to="/"
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow"
					>
						Log in
					</Link>
				</div>
			</header>
			{/* Main */}
			<main className="flex-1 flex items-center justify-center px-6 py-12">
				<div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">
					{/* LEFT SIDE */}
					<div className="p-10 bg-gradient-to-br from-blue-50 to-white">
						<h2 className="text-4xl font-bold text-slate-900 mb-4">
							Create your account 🚀
						</h2>

						<p className="text-slate-600 leading-relaxed">
							Join Event Ease to explore, manage, and participate
							in campus events. Students can register instantly
							while teacher accounts require admin approval.
						</p>

						<div className="mt-10 bg-white border rounded-xl p-6 shadow-sm">
							<h4 className="font-semibold text-slate-800 mb-4">
								Why join?
							</h4>

							<ul className="text-sm text-slate-600 space-y-3">
								<li>🎯 Discover exciting campus events</li>
								<li>📅 Manage registrations easily</li>
								<li>🔔 Get real-time updates</li>
								<li>📊 Track your participation</li>
							</ul>
						</div>
					</div>
					{/* RIGHT FORM */}
					<div className="p-10">
						<h3 className="text-2xl font-bold text-slate-800 mb-6">
							Register
						</h3>
						<form onSubmit={handleSubmit} className="space-y-5">
							{/* Input Group */}
							<div>
								<label className="text-sm font-medium text-slate-700">
									Full Name
								</label>
								<input
									type="text"
									className="w-full mt-1 border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
									placeholder="John Doe"
									onChange={(e) =>
										setForm({
											...form,
											full_name: e.target.value,
										})
									}
								/>
							</div>
							<div>
								<label className="text-sm font-medium text-slate-700">
									Email
								</label>
								<input
									type="email"
									className="w-full mt-1 border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
									placeholder="you@college.edu"
									onChange={(e) =>
										setForm({
											...form,
											email: e.target.value,
										})
									}
								/>
							</div>
							<div>
								<label className="text-sm font-medium text-slate-700">
									Phone (optional)
								</label>
								<input
									type="tel"
									className="w-full mt-1 border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
									placeholder="+91 XXXXXXXX"
									onChange={(e) =>
										setForm({
											...form,
											phone: e.target.value,
										})
									}
								/>
							</div>
							<div>
								<label className="text-sm font-medium text-slate-700">
									Password
								</label>
								<input
									type="password"
									className="w-full mt-1 border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
									placeholder="Create a strong password"
									onChange={(e) =>
										setForm({
											...form,
											password: e.target.value,
										})
									}
								/>
							</div>
							<div>
								<label className="text-sm font-medium text-slate-700">
									Account Type
								</label>
								<select
									className="w-full mt-1 border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
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
								<>
									<div></div>
									<div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
										Teacher accounts require admin approval
										before login.
									</div>
								</>
							)}
							{error && (
								<div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">
									{error}
								</div>
							)}
							<button
								type="submit"
								disabled={loading}
								className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition shadow-md disabled:opacity-60"
							>
								{loading
									? "Creating account..."
									: "Create Account"}
							</button>
						</form>
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
