import axios from "axios";
import { TOKEN_KEY } from "../utils/constants";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
    timeout: 20000,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.message || error.message || "Something went wrong";
        return Promise.reject(new Error(message));
    }
);

export default axiosInstance;