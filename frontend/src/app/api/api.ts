import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("vinsport_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["ngrok-skip-browser-warning"] = "true";

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("Lỗi kết nối hệ thống VinSport:", error.message);

    if (error?.response?.status === 401) {
      localStorage.removeItem("vinsport_token");
      localStorage.removeItem("vinsport_user");
    }

    return Promise.reject(error);
  }
);

export default api;