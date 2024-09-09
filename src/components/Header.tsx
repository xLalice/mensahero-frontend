import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  toggleDropdown: () => void;
  dropdownVisible: boolean;
  handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleDropdown, dropdownVisible, handleLogout }) => {
  return (
    <div className="flex justify-between items-center h-16">
      <img src="/header.png" className="w-[150px]" alt="Header" />
      <div className="relative">
        <img
          src="/hamburger.png"
          alt="menu"
          className="w-8 h-8 mb-4 cursor-pointer mt-4"
          onClick={toggleDropdown}
        />
        {dropdownVisible && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
            <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
              Profile
            </Link>
            <Link to="/group-chat" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
              Create a group chat
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
