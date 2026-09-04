import { Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import Signup from "../pages/signup";
import VerifyOtp from "../pages/verifyOtp";
import ForgotPassword from "../pages/forgotPassword";
import ResetPassword from "../pages/resetPassword";
import GuestRoute from "../components/guestRoutes";

const AuthRoutes = () => {
	return (
		<Routes>
			<Route
				path="/"
				element={
					<GuestRoute>
						<Login />
					</GuestRoute>
				}
			/>

			<Route
				path="/login"
				element={
					<GuestRoute>
						<Login />
					</GuestRoute>
				}
			/>

			<Route
				path="/signup"
				element={
					<GuestRoute>
						<Signup />
					</GuestRoute>
				}
			/>

			<Route
				path="/verify"
				element={
					<GuestRoute>
						<VerifyOtp />
					</GuestRoute>
				}
			/>

			<Route
				path="/forgot-password"
				element={
					<GuestRoute>
						<ForgotPassword />
					</GuestRoute>
				}
			/>

			<Route
				path="/reset-password"
				element={
					<GuestRoute>
						<ResetPassword />
					</GuestRoute>
				}
			/>
		</Routes>
	);
};

export default AuthRoutes;
