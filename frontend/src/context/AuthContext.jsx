import { createContext, useEffect, useState } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token) {
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      return;
    }

    // If token exists, try fetching the latest profile to keep UI (header) up-to-date
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        if (res.data && res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          setUser(res.data.user);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch profile on init", err);
      }

      // fallback to saved user if fetch fails
      if (savedUser) setUser(JSON.parse(savedUser));
    };

    fetchProfile();
  }, []);
  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};