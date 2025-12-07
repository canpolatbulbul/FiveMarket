import { useState } from "react";
import { APICore } from "@/helpers/apiCore.js";
import { useAuth } from "@/contexts/AuthContext.jsx";

export default function useBecomeFreelancer() {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const api = new APICore();

  const becomeFreelancer = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const path = "/api/user/becomeFreelancer";
      const response = await api.post(`${path}`);

      // Update user with new freelancer role
      setUser(response.data.user);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { becomeFreelancer, isLoading, error };
}
