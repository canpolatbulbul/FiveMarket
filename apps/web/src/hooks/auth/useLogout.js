import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APICore } from "@/helpers/apiCore.js";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { setAuthorization } from "@/helpers/apiCore.js";

export default function useLogout() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const api = new APICore();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);

    try {
      // Clear authorization
      setAuthorization(null);

      // Clear token from localStorage
      api.storeToken(null);

      // Clear refresh token from localStorage
      localStorage.removeItem("refreshToken");

      // Clear user from context
      setUser(null);

      // Redirect to landing page.
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { logout, isLoading };
}
