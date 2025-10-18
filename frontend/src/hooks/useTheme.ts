import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "llm-playground-theme";

export function useTheme(): [Theme, (theme: Theme) => void, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    const saved = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return [theme, setTheme, toggle];
}
