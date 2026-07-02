import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getMe, loginUser, registerUser, logoutUser } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "checking" while we ask the backend "am I still logged in?" on first load,
  // so we don't flash the login screen before we know the answer.
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    getMe()
      .then((data) => {
        setUser(data.user);
        setStatus("ready");
      })
      .catch(() => {
        setUser(null);
        setStatus("ready");
      });
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginUser({ email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await registerUser({ name, email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser().catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
