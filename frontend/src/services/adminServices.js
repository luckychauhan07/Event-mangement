import api from "../api/api";

export const getAdminDashboardSummary = async () => {
	const response = await api.get("/admin/dashboard");
	return response.data;
};

export const getPendingTeachers = async () => {
	const res = await api.get("/admin/teachers-approvals");

	return res.data;
};

export const approveTeacher = async (id) => {
	const res = await api.patch(`/admin/teachers-approvals/${id}/approve`, {
		action: "approve",
	});
	return res.data;
};

export const rejectTeacher = async (id, reason) => {
	const res = await api.patch(`/admin/teachers-approvals/${id}/reject`, {
		action: "reject",
		reason,
	});
	return res.data;
};

export const getAdminProfile = async () => {
	const res = await api.get("/admin/profile");
	return res.data;
};

export const getAdminProfileIncomplete = async () => {
	const res = await api.get("/admin/profile/incomplete");
	return res.data;
};

export const updateAdminProfile = async (profileData) => {
	const res = await api.put("/admin/profile", profileData);
	return res.data;
};

export const patchAdminProfile = async (data) => {
	const res = await api.patch("/admin/profile", data);
	console.log("Patch Admin Profile Response:", res);
	return res.data;
};
