import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

export const setupAxiosInterceptors = (navigate: Function) => {
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        navigate("/login");
        alert("Session expired. Please log in again");
      }
      return Promise.reject(error);
    }
  );
};

export default api;
