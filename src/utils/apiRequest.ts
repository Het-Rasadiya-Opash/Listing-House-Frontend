import axios from "axios";
import toast from "react-hot-toast";

const apiRequest = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
  withCredentials: true,
});

apiRequest.interceptors.response.use(
  (response) => {
    if (response.data && response.data.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    let errorMessage = "An unexpected error occurred.";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (typeof error.response?.data === "string") {
      errorMessage = error.response.data;
    } else if (error.message) {
      errorMessage = error.message;
    }
    toast.error(errorMessage);

    if (error.response?.status === 401) {
      import("./authStore").then((module) => {
        module.default.getState().removeCurrentUser();
      });
    }

    return Promise.reject(error);
  },
);

export default apiRequest;
