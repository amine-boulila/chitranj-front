import axios from "axios";

const api = axios.create({
  baseURL: "https://chitranj-back.onrender.com",
  withCredentials: true,
});

export default api;
