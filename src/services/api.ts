import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401){
      const navigate = useNavigate();
      navigate("/login");
      alert("Session expired. Please log in again");
    }
    return Promise.reject(error);
  }
);



export default api;