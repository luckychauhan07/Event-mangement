import api from "../api/api";

export const createEvent = async (data) => {
	const res = await api.post("/event", data);
	console.log("Event created:", res);
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

export const deleteEvent = async (id) => {
	console.log("Attempting to delete event with ID:", id);
	const res = await api.delete(`/event/${id}`);
	return res.data;
};

export const cancelEvent = async (id) => {
	const res = await api.put(`/event/${id}/cancel`);
	return res.data;
};
