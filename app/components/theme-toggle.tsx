"use client";

import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

function setTheme(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
}

export default function ThemeToggle() {
  const [theme, setThemeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("emby-theme");
    const nextTheme: ThemeMode = stored === "light" ? "light" : "dark";
    setTheme(nextTheme);
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    setThemeState(nextTheme);
    localStorage.setItem("emby-theme", nextTheme);
  };

  return (
    <button className="theme-toggle" onClick={toggleTheme} type="button">
      {theme === "dark" ? "白色模式" : "黑色模式"}
    </button>
  );
}
