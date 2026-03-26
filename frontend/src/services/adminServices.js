import api from "../api/api";

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
