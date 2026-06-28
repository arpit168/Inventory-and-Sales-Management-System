import { create } from "zustand";

const getInitialTheme = () => {
  return localStorage.getItem("theme") || "light";
};

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return { theme: newTheme };
    }),

  setTheme: (theme) => {
    console.log(theme);

    localStorage.setItem("theme", theme);
    set({ theme });
  },
}));
