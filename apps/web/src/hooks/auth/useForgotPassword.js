import { useState } from "react";
import { APICore } from "@/helpers/apiCore.js";

export default function useForgotPassword() {
  const [error, setError] = useState();
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const api = new APICore();

  const forgotPassword = async ({ email }) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const path = "/api/auth/forgot-password";
      await api.post(`${path}`, { email });

      // Set success state
      setSuccess(true);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return { error, success, isLoading, forgotPassword, reset };
}
