import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
	const user = JSON.parse(localStorage.getItem("user"));
	const token = localStorage.getItem("token");

	// not logged in
	if (!token) {
		return <Navigate to="/login" />;
	}

	// logged in but not admin
	if (user?.role !== "admin") {
		return <Navigate to="/student/dashboard" />;
	}

	return children;
};

export default AdminRoute;
