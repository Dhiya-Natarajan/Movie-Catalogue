import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API || "http://localhost:5000", // Adjust based on your setup
  withCredentials: true, // 👈 ensures cookies are sent
});

export default axiosInstance;
