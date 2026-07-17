import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const THEME_KEY = "bankislami-theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY) as Theme | null;
    const next = saved === "light" || saved === "dark" ? saved : "dark";
    setTheme(next);
    applyTheme(next);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    window.localStorage.setItem(THEME_KEY, next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="size-10 rounded-full border border-white/10 bg-white/10 text-foreground hover:bg-white/15 inline-grid place-items-center transition-colors cursor-pointer"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}