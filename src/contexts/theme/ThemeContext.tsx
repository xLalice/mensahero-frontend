import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ThemeType, Theme } from './Theme.model';
import { THEMES } from './Theme.config';

interface ThemeContextProps {
  themeType: ThemeType;
  theme: Theme;
  setThemeType: (themeType: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeType, setThemeType] = useState<ThemeType>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType | null;
    if (savedTheme) {
      setThemeType(savedTheme);
    }
   
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', themeType);

    const theme = THEMES[themeType];
    Object.keys(theme).forEach(key => {
      document.documentElement.style.setProperty(key, theme[key as keyof Theme]);
    });
    if (themeType === "dark"){
      document.body.style.background = "#222831";
      document.body.style.color = "#EEE";
    } else {
      document.body.style.background = "#EEEEEE";
      document.body.style.color = "#222831";
    }
  }, [themeType]);

  const toggleTheme = () => {
    setThemeType(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ themeType, theme: THEMES[themeType], setThemeType: toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
