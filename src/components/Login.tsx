import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        username,
        password,
      });

      const token = response.data.token;
      localStorage.setItem('token', token);
      console.log('Login successful');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError('Login failed: ' + (error.response.data.message || 'Unknown error'));
      } else {
        setError('Login failed');
      }
      console.error(error);
    }
  };

  return (
    <div className="text-left">
      <h2 className="font-bold text-2xl mt-[100px] mb-8">Login</h2>
      {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</p>}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className='flex flex-col'>
          <label htmlFor="username" >Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className = "p-2 border-2 border-gray-200"
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className = "p-2 border-2 border-gray-200"
          />
        </div>
        <button type="submit" className='bg-blue-500 text-white p-2 rounded-3xl'>Login</button>
        <p className="text-blue-500 text-center">
          <Link to="/signup">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
