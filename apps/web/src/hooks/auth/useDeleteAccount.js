import { APICore } from "@/helpers/apiCore.js";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { setAuthorization } from "@/helpers/apiCore.js";

export default function useDeleteAccount() {
  const { user, setUser } = useAuth();
  const api = new APICore();

  const deleteAccount = async () => {
    try {
      const path = `/api/user/${user.userID}`;
      await api.delete(`${path}`);
      setUser(undefined);
      setAuthorization(null);
      api.storeToken(null);
    } catch (error) {
      console.error("Failed to delete account:", error);
      throw error;
    }
  };

  return { deleteAccount };
}
