import React from 'react';
import { useTheme } from '../contexts/theme/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { themeType, setThemeType } = useTheme();

  const handleToggle = () => {
    setThemeType(themeType === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={handleToggle}
      className="w-8 h- ml-auto"
    >
      <img src={`${themeType === "dark" ? "light": "dark"}.png`} alt="" />
    </button>
  );
};

export default ThemeToggle;
