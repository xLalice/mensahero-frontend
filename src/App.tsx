import { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import Login from './components/Login'
import Signup from './components/Signup'

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			setIsLoggedIn(true);
		}
	}, []);

	const handleLogOut = () => {
		localStorage.removeItem('token');
		setIsLoggedIn(false);
	}


	return (
		<Router>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/" element={<Login />} />
			</Routes>
		</Router>
	);
};

export default App
