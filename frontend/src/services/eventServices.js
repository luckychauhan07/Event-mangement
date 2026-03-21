import api from "../api/api";

export const createEvent = async (data) => {
	const res = await api.post("/event", data);
	return res.data;
};

export const getAllTeachers = async () => {
	const res = await api.get("/event/teachers");
	console.log("Fetched teachers:", res.data);
	return res.data;
};

export const getAllEvents = async () => {
	const res = await api.get("/event");
	return res.data;
};

export const getEventById = async (id) => {
	const res = await api.get(`/event/${id}`);
	return res.data;
};
