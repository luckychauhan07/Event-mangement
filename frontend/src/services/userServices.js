import api from "@/api/api";

export const getAllUsers = async () => {
	const res = await api.get("/admin/users");
	return res.data;
};

export const getUserDetails = async (id) => {
	const res = await api.get(`/admin/users/${id}`);
	return res.data;
};

export const deleteUser = async (id) => {
	const res = await api.delete(`/admin/users/${id}`);
	return res.data;
};

export const changeUserStatus = async (id, action) => {
	const res = await api.patch(`/admin/users/${id}/action`, {
		action: action.trim().toLowerCase(),
	});
	return res.data;
};

export const updateUserDetails = async (id, userDetails) => {
	const res = await api.put(`/admin/users/${id}`, userDetails);
	return res.data;
};

export const getMyEventRegistrations = async () => {
	const res = await api.get("/api/user/registrations");
	return res.data;
};
