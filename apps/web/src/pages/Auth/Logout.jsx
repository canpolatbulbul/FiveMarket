import {useEffect} from "react";
import useLogout from "../../hooks/auth/useLogout";
import LoadingSpinner from "../../components/LoadingSpinner";

const Logout = () => {
    const {logout} = useLogout();

    useEffect(() => {
        logout();
    }, [logout]);

    // Show loading while logout is processing
    // The logout hook will handle navigation to /auth/login
    return <LoadingSpinner fullScreen message="Logging out..." />;
};

export default Logout;