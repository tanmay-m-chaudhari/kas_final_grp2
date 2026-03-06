import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("tf_user") || "null"),
  token: localStorage.getItem("tf_token") || null,
  login: (token, user) => {
    localStorage.setItem("tf_token", token);
    localStorage.setItem("tf_user", JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("tf_token");
    localStorage.removeItem("tf_user");
    set({ token: null, user: null });
  },
}));

export default useAuthStore;
