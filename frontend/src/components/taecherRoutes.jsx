import { Navigate } from "react-router-dom";

const TeacherRoute = ({ children }) => {
	const user = JSON.parse(localStorage.getItem("user"));
	const token = localStorage.getItem("token");

	// not logged in
	if (!token) {
		return <Navigate to="/login" />;
	}

	// logged in but not admin
	if (user?.role !== "teacher") {
		return <Navigate to="/student/dashboard" />;
	}

	return children;
};

export default TeacherRoute;
