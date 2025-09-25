import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(() => {
    const savedTokens = localStorage.getItem("tokens");
    return savedTokens ? JSON.parse(savedTokens) : null;
  });
  const navigate = useNavigate();

    
  const saveAuthData = (tokens, user) => {
    localStorage.setItem("tokens", JSON.stringify(tokens));
    localStorage.setItem("user", JSON.stringify(user));
    setTokens(tokens);
    setUser(user);
  };

  
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  
  const login = async (email , password) => {
    console.log('Context', email)
    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid credentials or server error");
      }
      const data = await response.json()
      console.log(data)
      const userInfo = {
        email: data.email,
        user_type: data.user_type,
        is_superuser: data.is_superuser || false,
      };
      
      saveAuthData({ access: data.access, refresh: data.refresh }, userInfo);
  

       
    
      if (userInfo.user_type === "superuser") {
        localStorage.setItem("role" , "superuser" )
        navigate("/admin");
      } else if (userInfo.user_type === "vendor") {
        localStorage.setItem("role" , "vendor" )
        navigate("/vendor");
      } else {
        navigate("/products");
      }

      return true;
    } catch (error) {
      console.error("Login error:", error.message);
      return false;
    }
  };
  



  const logout = () => {
    localStorage.removeItem("tokens");
    localStorage.removeItem("user");
    setTokens(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, tokens, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
