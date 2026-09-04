import api from "../api/api";

export const registerUser = async (data) => {
	const res = await api.post("/auth/register", data);
	return res.data;
};

export const verifyOtp = async (data) => {
	const res = await api.post("/auth/verify", data);
	return res.data;
};

export const loginUser = async (data) => {
	const res = await api.post("/auth/login", data);

	return res.data;
};

export const resendOtp = async (email) => {
	const res = await api.post("/auth/resend-otp", { email });
	return res.data;
};

export const requestPasswordReset = async (email) => {
	const res = await api.post("/auth/forgot-password", { email });
	return res.data;
};

export const resetPassword = async (data) => {
	const res = await api.post("/auth/reset-password", data);
	return res.data;
};
