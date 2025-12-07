import { useState } from "react";
import { APICore } from "@/helpers/apiCore.js";

export default function useResetPassword() {
  const [error, setError] = useState();
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const api = new APICore();

  const resetPassword = async ({ token, password }) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const path = "/api/auth/reset-password";
      await api.post(`${path}`, { token, password });

      // Set success state
      setSuccess(true);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { error, success, isLoading, resetPassword };
}
