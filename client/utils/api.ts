import axios from "axios";

const api = axios.create({
  baseURL: "https://chitranj-back.onrender.com/", // Replace with your backend URL
  withCredentials: true,
});

export default api;
