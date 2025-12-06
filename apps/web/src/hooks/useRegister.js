import { useState } from "react";
import { APICore } from "@/helpers/apiCore.js";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { setAuthorization } from "@/helpers/apiCore.js";

export default function useRegister() {
  const { user, setUser } = useAuth();
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const api = new APICore();

  const register = async ({ first_name, last_name, email, password, role }) => {
    setIsLoading(true);
    setError(null);

    try {
      const path = "/api/auth/register";
      const response = await api.post(`${path}`, {
        first_name,
        last_name,
        email,
        password,
        role, // "client" or "freelancer"
      });

      setUser(response.data.user);
      api.storeToken(response.data.token);
      setAuthorization(response.data.token);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { user, error, isLoading, register };
}
