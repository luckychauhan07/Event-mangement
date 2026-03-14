import { Navigate } from "react-router-dom";

const GuestRoute = ({ children }) => {
	const user = JSON.parse(localStorage.getItem("user"));
	const token = localStorage.getItem("token");

	// if user already logged in → redirect
	if (token) {
		if (user.role === "admin") {
			return <Navigate to="/admin" />;
		}

		if (user.role === "teacher") {
			return <Navigate to="/teacher/dashboard" />;
		}

		return <Navigate to="/student/dashboard" />;
	}

	return children;
};

export default GuestRoute;
