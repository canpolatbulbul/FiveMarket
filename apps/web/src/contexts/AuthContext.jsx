import {createContext, useContext, useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import {APICore, setAuthorization} from "../helpers/apiCore.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";


const AuthContext = createContext(undefined);

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const initializeAuth = async () => {
            const api = new APICore();
            const token = localStorage.getItem("token");
            const refreshToken = localStorage.getItem("refreshToken");
            
            if (token) {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decoded.exp > currentTime) {
                    // Token is still valid
                    setAuthorization(token);
                    try {
                        const response = await api.me();
                        setUser(response.data.user);
                    } catch (error) {
                        console.error("Failed to fetch user:", error);
                        localStorage.removeItem("token");
                    }
                } else if (refreshToken) {
                    // Token expired but we have a refresh token
                    try {
                        const response = await api.post("/api/auth/refresh", { refreshToken });
                        const newToken = response.data.token;
                        api.storeToken(newToken);
                        setAuthorization(newToken);
                        setUser(response.data.user);
                    } catch (error) {
                        console.error("Failed to refresh token:", error);
                        localStorage.removeItem("token");
                        localStorage.removeItem("refreshToken");
                    }
                } else {
                    // Token expired and no refresh token
                    localStorage.removeItem("token");
                }
            } else if (refreshToken) {
                // No access token but we have a refresh token
                try {
                    const response = await api.post("/api/auth/refresh", { refreshToken });
                    const newToken = response.data.token;
                    api.storeToken(newToken);
                    setAuthorization(newToken);
                    setUser(response.data.user);
                } catch (error) {
                    console.error("Failed to refresh token:", error);
                    localStorage.removeItem("refreshToken");
                }
            }
            setLoading(false); // Done checking
        };

        initializeAuth();
    }, []);

    // Show loading screen while checking authentication
    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const Context = useContext(AuthContext);
    if (!Context) {
        throw new Error("useAuth must be used within a AuthProvider");
    }
    return Context;
};
