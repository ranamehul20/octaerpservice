// AuthContext.js
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
    try{
      const response = await checkAuthentication();
      console.log("Auth response:", response);
      if (response.code === 200 && !response.errors) {
        console.log("Auth response1:", response);
        setIsAuthenticated(true);
        setLoading(false);
      } else {
        setIsAuthenticated(false);
        setLoading(false);
        navigate("/login");
      }
    }catch(e){
      setIsAuthenticated(false);
        setLoading(false);
        navigate("/login");
    }
  };
  useEffect(() => {
    console.log("navigate");
    checkAuth();
  }, [navigate]);

  const logout = async () => {
    const res = await logoutService();
    if (res.code === 200 && !res.error) {
      setIsAuthenticated(false);
      setLoading(false);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
