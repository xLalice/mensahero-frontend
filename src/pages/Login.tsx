import React, { useState } from "react";
import axios from "axios";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import ThemeToggle from "../components/ThemeToggle";

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUserId } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });
      const { user } = response.data;
      localStorage.setItem("userId", user.id);
      setUserId(user.id);
      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(
          "Login failed: " + (error.response.data.message || "Unknown error")
        );
      } else {
        setError("Login failed");
      }
      console.error(error);
    }
  };

  return (
    <>
      <header className="flex justify-between items-center w-full p-8 mt-8 h-[60px]">
        <img src="/header.png" alt="Logo" className="w-[150px] md:w-[350px]" />
        <ThemeToggle />
      </header>
      <div className="min-h-screen flex flex-col justify-center items-center md:max-w-2xl mx-auto">
        <div className="w-full p-4 p-6 rounded-lg shadow-md">
          <h2 className="font-bold text-2xl mb-8">Login</h2>
          {error && (
            <p className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</p>
          )}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label htmlFor="username" className="mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="p-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-[var(--background-color)] text-[var(--text-color)]"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="password" className="mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="p-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-[var(--background-color)] text-[var(--text-color)]"
              />
            </div>
            <button
              type="submit"
              className="bg-[var(--primary-color)] text-white p-2 rounded-full transition hover:bg-opacity-80"
            >
              Login
            </button>
            <p className="text-center text-[var(--primary-color)]">
              <Link to="/signup">Create an account</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
