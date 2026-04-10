import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authAPI
        .me()
        .then((data) => {
          if (data.id) setUser(data);
          else localStorage.removeItem("token");
        })
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    if (data.token) {
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const register = async (name, email, password) => {
    const data = await authAPI.register({ name, email, password });
    if (data.token) {
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateBudget = (budget) => setUser((u) => ({ ...u, budget }));

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateBudget }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
