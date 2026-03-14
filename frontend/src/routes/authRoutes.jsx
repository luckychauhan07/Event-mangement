import { Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import Signup from "../pages/signup";
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
				path="/signup"
				element={
					<GuestRoute>
						<Signup />
					</GuestRoute>
				}
			/>
		</Routes>
	);
};

export default AuthRoutes;
