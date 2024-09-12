import React, { useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle";

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.post("/auth/register", {
        email,
        username,
        password,
      });
      console.log("Signup successful");
      navigate("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Unknown error";
        setError("Signup failed: " + errorMessage);
      } else {
        setError("Signup failed");
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
      <div className="p-4 md:max-w-2xl mx-auto">
        <h2 className="font-bold text-2xl mb-8">Sign Up</h2>
        {error && (
          <p className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</p>
        )}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              className="p-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-[var(--background-color)] text-[var(--text-color)]"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="p-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-[var(--background-color)] text-[var(--text-color)]"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="p-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-[var(--background-color)] text-[var(--text-color)]"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="confirm-password">Confirm Password:</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              className="p-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-[var(--background-color)] text-[var(--text-color)]"
            />
          </div>
          <button
            type="submit"
            className="bg-[var(--primary-color)] text-white p-2 rounded-3xl"
          >
            Sign Up
          </button>
          <p className="mt-4 text-gray-400 text-center">
            Already have an account?{" "}
            <Link to="/login">
              <span className="text-blue-800 font-bold">Login</span>
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default Signup;
