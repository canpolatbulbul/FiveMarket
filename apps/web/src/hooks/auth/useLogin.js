import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APICore, setAuthorization } from "@/helpers/apiCore.js";
import { useAuth } from "@/contexts/AuthContext.jsx";

export default function useLogin() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const api = new APICore();

  const login = async ({ email, password, rememberMe }) => {
    setIsLoading(true);
    setError(null);

    try {
      const path = "/api/auth/login";
      const response = await api.post(`${path}`, {
        email,
        password,
        rememberMe,
      });

      setUser(response.data.user);
      // Store access token in localStorage if rememberMe, otherwise sessionStorage
      api.storeToken(response.data.token, rememberMe);
      setAuthorization(response.data.token);

      // Store refresh token if rememberMe is enabled
      if (rememberMe && response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }

      // Navigate to home after successful login
      navigate("/");
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { error, isLoading, login };
}
