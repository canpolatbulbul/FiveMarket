import { useState } from "react";
import { APICore } from "@/helpers/apiCore.js";

// helpers

export default function useResetPassword() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const resetPassword = async (newPassword, token, userID) => {
    const api = new APICore();

    try {
      await api.post("api/auth/resetPassword", { newPassword, token, userID });
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    }
  };

  return [success, error, resetPassword];
}
