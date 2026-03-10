import { Link } from "react-router-dom";
import { logout } from "../utils/auth";

const TeacherDashboard = () => {
	return (
		<>
			<div>
				<button
					onClick={logout}
					className="text-red-500 hover:text-red-600"
				>
					Logout
				</button>
			</div>
			<h1>Teacher Dashboard</h1>
			<p>Welcome, Teacher!</p>
			<Link to="/admin/dashboard/add-event">create a new event</Link>
		</>
	);
};
export default TeacherDashboard;
