export const getStoredUser = () => {
	try {
		const user = localStorage.getItem("user");
		return user ? JSON.parse(user) : null;
	} catch (error) {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		return null;
	}
};
