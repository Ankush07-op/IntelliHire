import { useState, useCallback, useMemo, useContext } from "react";
import { AuthContext } from "./authContext";

// Safely parse localStorage user JSON
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user") || localStorage.getItem("ats_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("ats_user");
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || localStorage.getItem("ats_token") || null
  );
  const [user, setUser] = useState(getStoredUser);

  const login = useCallback((arg1, arg2) => {
    let receivedToken;
    let receivedUser;

    if (arg1 && typeof arg1 === "object" && arg1.token) {
      // Called with { token, user } (applicant pattern)
      receivedToken = arg1.token;
      receivedUser = arg1.user;
    } else {
      // Called with (token, user) (recruiter pattern)
      receivedToken = arg1;
      receivedUser = arg2;
    }

    if (receivedToken) {
      localStorage.setItem("token", receivedToken);
      localStorage.setItem("ats_token", receivedToken);
    }
    if (receivedUser) {
      const userStr = typeof receivedUser === "string" ? receivedUser : JSON.stringify(receivedUser);
      localStorage.setItem("user", userStr);
      localStorage.setItem("ats_user", userStr);
    }

    setToken(receivedToken || null);
    setUser(receivedUser || null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("ats_token");
    localStorage.removeItem("user");
    localStorage.removeItem("ats_user");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn: Boolean(token),
      isAuthenticated: Boolean(token),
      token,
      user,
      login,
      signIn: login,
      logout,
      signOut: logout,
    }),
    [token, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
