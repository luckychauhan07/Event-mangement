import api from "./api";

export const getMyNotifications = async (params = {}) => {
	const response = await api.get("/notifications/mine", { params });
	return response.data;
};

export const markNotificationRead = async (id) => {
	const response = await api.post(`/notifications/${id}/read`);
	return response.data;
};

/**
 * Marks all unread notifications for the current user as read.
 */
export const markAllNotificationsRead = async () => {
	const response = await api.post("/notifications/mark-all-read");
	return response.data;
};
