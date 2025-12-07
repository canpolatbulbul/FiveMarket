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

  const login = async ({ email, password }) => {
    setIsLoading(true);
    setError(null);

    try {
      const path = "/api/auth/login";
      const response = await api.post(`${path}`, { email, password });
      setUser(response.data.user);
      api.storeToken(response.data.token);
      setAuthorization(response.data.token);

      // Navigate to home after successful login
      navigate("/home");
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { error, isLoading, login };
}
