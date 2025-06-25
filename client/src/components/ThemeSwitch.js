"use client";

import { useEffect } from "react";

export default function ThemeSwitch() {
  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggle = () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="p-2 rounded-full border fixed top-4 right-4 bg-white dark:bg-gray-800 transition"
    >
      🌓
    </button>
  );
}
