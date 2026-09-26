import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isRecruiterLoggedIn") === "true"
  );

  const [recruiter, setRecruiter] = useState(() => {
    const savedAccount = localStorage.getItem("recruiterAccount");

    return savedAccount ? JSON.parse(savedAccount) : null;
  });

  const login = (account) => {
    localStorage.setItem("isRecruiterLoggedIn", "true");

    setIsLoggedIn(true);
    setRecruiter(account);
  };

  const logout = () => {
    localStorage.removeItem("isRecruiterLoggedIn");

    setIsLoggedIn(false);
    setRecruiter(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        recruiter,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}