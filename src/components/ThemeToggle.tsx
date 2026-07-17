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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY) as Theme | null;
    const next = saved === "light" || saved === "dark" ? saved : "dark";
    setTheme(next);
    applyTheme(next);
    setMounted(true);
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
      aria-label={`Switch to ${mounted && theme === "light" ? "dark" : "light"} theme`}
      title={`Switch to ${mounted && theme === "light" ? "dark" : "light"} theme`}
    >
      {mounted && theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}