import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api";

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("token").then(async t => {
      if (t) {
        setToken(t);
        try { setUser(await api.me()); } catch { await logout(); }
      }
      setLoading(false);
    });
  }, []);

  const login = async (username, password) => {
    const data = await api.login({ username, password });
    await AsyncStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
