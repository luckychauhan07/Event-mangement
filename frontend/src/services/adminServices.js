import api from "../api/api";

export const getPendingTeachers = async () => {
	const res = await api.get("/admin/pending-teachers");

	return res.data;
};

export const approveTeacher = async (id, action) => {
	const res = await api.patch(`/admin/users/${id}/${action}`);

	return res.data;
};
