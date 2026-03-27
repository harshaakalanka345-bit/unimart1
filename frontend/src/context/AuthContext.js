import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Simple fetch-based API helper (no axios needed)
const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem("unimart_token");
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// API object matching axios-like usage used in pages
export const API = {
  get: (path, config = {}) => {
    let query = "";
    if (config.params) {
      query = "?" + new URLSearchParams(config.params).toString();
    }
    return apiFetch(path + query, config);
  },
  post:  (path, body)   => apiFetch(path, { method: "POST",  body: JSON.stringify(body) }),
  put:   (path, body)   => apiFetch(path, { method: "PUT",   body: JSON.stringify(body) }),
  patch: (path, body)   => apiFetch(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete:(path)         => apiFetch(path, { method: "DELETE" }),
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]                   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const data = await API.get("/messages/unread/count");
      setUnreadMessages(data.count || 0);
    } catch {}
  }, []);

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem("unimart_token");
    if (token) {
      API.get("/auth/me")
        .then((data) => {
          setUser(data.user);
          fetchUnread();
        })
        .catch(() => { localStorage.removeItem("unimart_token"); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUnread]);

  // Poll unread every 30s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user, fetchUnread]);

  const login = async (email, password) => {
    const data = await API.post("/auth/login", { email, password });
    localStorage.setItem("unimart_token", data.token);
    setUser(data.user);
    fetchUnread();
    return data.user;
  };

  const register = async (formData) => {
    const data = await API.post("/auth/register", formData);
    localStorage.setItem("unimart_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("unimart_token");
    setUser(null);
    setUnreadMessages(0);
  };

  const updateUser = (updatedUser) =>
    setUser((prev) => ({ ...prev, ...updatedUser }));

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser,
               unreadMessages, setUnreadMessages, API }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
