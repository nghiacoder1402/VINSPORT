import axios from "axios";

const api = axios.create({
  baseURL: "https://reprise-royal-snowbound.ngrok-free.dev/api",
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
    console.error("Lỗi kết nối hệ thống VinSport:", error);

    if (error?.response?.status === 401) {
      localStorage.removeItem("vinsport_token");
      localStorage.removeItem("vinsport_user");
    }

    return Promise.reject(error);
  }
);

export default api;