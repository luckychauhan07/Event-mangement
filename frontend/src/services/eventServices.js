import api from "../api/api";

export const createEvent = async (data) => {
	console.log("Creating event with data:", data);
	const res = await api.post("/event/add-event", data);
	console.log("Event created:", res.data);
	return res.data;
};

export const getAllTeachers = async () => {
	const res = await api.get("/event/teachers");
	console.log("Fetched teachers:", res.data);
	return res.data;
};
