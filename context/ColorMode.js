import React, { createContext, useContext, useState, useEffect } from "react";
import { lightTheme, darkTheme } from "./themes";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "user_theme";
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme); // Default theme is light
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (storedTheme === "dark") {
          setTheme(darkTheme);
        } else {
          setTheme(lightTheme);
        }
      } catch (e) {
        console.error("Failed to load theme", e);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = theme === lightTheme ? darkTheme : lightTheme;
      setTheme(newTheme);
      await AsyncStorage.setItem(THEME_KEY, newTheme === darkTheme ? "dark" : "light");
    } catch (e) {
      console.error("Failed to save theme", e);
    }
  };

  if (loading) return null; // Optional: avoid flicker on load

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
