import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutService, checkAuthentication } from "./services/AuthService";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const response = await checkAuthentication();
      if (response.code === 200 && !response.errors) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error during authentication check:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication on initial load
    checkAuth();
  }, []); // Empty dependency array ensures this runs only once on mount

  const logout = async () => {
    try {
      const res = await logoutService();
      if (res.code === 200 && !res.error) {
        setIsAuthenticated(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};