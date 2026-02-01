import axios from "axios";
import { enqueueSnackbar } from 'notistack';


const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

//Response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    let message = "An unexpected error occurred.";
    if (error.response) {
      if (error.response.data?.message?.toLowerCase()?.includes("duplicate entry")) {
        // Ignore duplicate entry errors, this is handled in component
        // ✅ Don’t show global toast
        return Promise.reject(error); // but still reject, so component catch gets it
      }
      // Server responded with a status other than 2xx
      message = error.response.data?.message || error.response.data?.error || `Error: ${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response received
      message = "No response from server. Please check your network.";
    } else {
      message = error.message;
    }

    // Show snackbar notification
    enqueueSnackbar(message, { variant: 'error' });
    return Promise.reject(error);
  })

/* ============================
🔐 REQUEST INTERCEPTOR
Attach JWT automatically
============================ */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // 🔐 AUTH ADDITION
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================
   🌍 RESPONSE INTERCEPTOR
   Global error handling
============================ */
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // 🔐 AUTH ADDITION: handle 401 globally
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    let message = "An unexpected error occurred.";

    if (error.response) {
      if (
        error.response.data?.message
          ?.toLowerCase()
          ?.includes("duplicate entry")
      ) {
        // Let component handle it
        return Promise.reject(error);
      }

      message =
        error.response.data?.message ||
        error.response.data?.error ||
        `Error: ${error.response.status}`;
    } else if (error.request) {
      message = "No response from server. Please check your network.";
    } else {
      message = error.message;
    }

    enqueueSnackbar(message, { variant: "error" });
    return Promise.reject(error);
  }
);

export default axiosInstance;
