import { useEffect, useState } from "react";

const STORAGE_KEY = "ims-theme";

const getInitialTheme = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const useTheme = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggleTheme };
};

export default useTheme;
