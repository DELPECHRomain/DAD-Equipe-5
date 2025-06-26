"use client";

export default function ThemeSwitch() {
  const toggle = () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="
        fixed top-4 right-4      
        p-2 rounded-full
        bg-white dark:bg-gray-800
        border z-50 shadow-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500
      "
    >
      🌓
    </button>
  );
}
