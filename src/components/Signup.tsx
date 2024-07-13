import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Link } from 'react-router-dom';

interface SignupResponse {
  token: string;
}

interface SignupProps {}

const Signup: React.FC<SignupProps> = () => {
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post<SignupResponse>('http://localhost:3000/api/auth/register', {
        email,
        username,
        password,
      });

      const token = response.data.token;
      localStorage.setItem('token', token);
      console.log('Signup successful');
      console.log(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Unknown error';
        setError('Signup failed: ' + errorMessage);
      } else {
        setError('Signup failed');
      }
      console.error(error);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="font-bold text-2xl mt-[100px] mb-8">Sign Up</h2>
      {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</p>}
      <form className="flex flex-col gap-4"onSubmit={handleSubmit}>
        <div className='flex flex-col'>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            className = "p-2 border-2 border-gray-200"
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className = "p-2 border-2 border-gray-200"
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className = "p-2 border-2 border-gray-200"
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor="confirm-password">Confirm Password:</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            className = "p-2 border-2 border-gray-200"
          />
        </div>
        <button type="submit" className='bg-blue-500 text-white p-2 rounded-3xl'>Sign Up</button>
        <p className="mt-4 text-gray-400">Already have an account? <Link to="/login"><span className="text-blue-800 font-bold">Login</span></Link></p>
      </form>
    </div>
  );
};

export default Signup;
