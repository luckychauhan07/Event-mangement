import { Link } from "react-router-dom";
import { logout } from "../utils/auth";

const AdminDashboard = () => {
	return (
		<>
			<h1>Admin Dashboard</h1>
			<p>Welcome, Admin!</p>
			<button
				onClick={logout}
				className="text-red-500 hover:text-red-600"
			>
				Logout
			</button>
			<Link to="/admin/teacher-approvals">View Pending Approvals</Link>
			<Link to="/admin/dashboard/add-event">create a new event</Link>
		</>
	);
};
export default AdminDashboard;
