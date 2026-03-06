import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("np_user") || "null"),
  token: localStorage.getItem("np_token") || null,
  login: (token, user) => {
    localStorage.setItem("np_token", token);
    localStorage.setItem("np_user", JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("np_token");
    localStorage.removeItem("np_user");
    set({ token: null, user: null });
  },
  updateUser: (updates) => set((s) => ({ user: { ...s.user, ...updates } })),
}));

export default useAuthStore;
