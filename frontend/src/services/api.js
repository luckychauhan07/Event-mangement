import axios from "axios";

// Get the base URL from environment variables, with a fallback for development
const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const api = axios.create({
	baseURL: API_BASE_URL,
});

// Add a request interceptor to include the token in every request
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token"); // Assumes token is in localStorage
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

export default api;