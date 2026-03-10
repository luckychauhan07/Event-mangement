import { logout } from "../utils/auth";

const Dashboard = () => {
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
			<h1>
				this is for the students where student can access the function
				of our project
			</h1>
		</>
	);
};
export default Dashboard;
