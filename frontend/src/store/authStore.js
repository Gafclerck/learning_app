import { create } from "zustand";

const useAuthStore = create((set) => ({
  // State initial
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user") || "null"),

  // Actions
  login: (token, user) => {
    // Sauvegarder dans localStorage pour persister
    // après un rafraîchissement de page
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    set({ token: null, user: null });
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
}));

export default useAuthStore;
