import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "dark", toggleTheme: () => {}, setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem("ongc_theme") || "dark"; } catch { return "dark"; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    try { localStorage.setItem("ongc_theme", theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setThemeState((t) => (t === "dark" ? "light" : "dark"));
  const setTheme = (mode) => setThemeState(mode);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
