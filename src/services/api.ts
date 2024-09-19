import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401){
      alert("Session expired. Please log in again");
    }
    return Promise.reject(error);
  }
);



export default api;