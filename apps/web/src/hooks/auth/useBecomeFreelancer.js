import { useState } from "react";
import { APICore } from "@/helpers/apiCore";
import { useAuth } from "@/contexts/AuthContext";

export const useBecomeFreelancer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { updateUser } = useAuth();

  const becomeFreelancer = async () => {
    setLoading(true);
    setError(null);

    try {
      const api = new APICore();
      const response = await api.post("/api/auth/become-freelancer", {});

      // Update user in AuthContext
      if (response.data.user) {
        updateUser(response.data.user);
      }

      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to become a freelancer";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { becomeFreelancer, loading, error };
};
