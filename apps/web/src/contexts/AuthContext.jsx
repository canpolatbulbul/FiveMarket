import {createContext, useContext, useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import {APICore, setAuthorization} from "../helpers/apiCore.js";


const AuthContext = createContext(undefined);

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState();

    useEffect(() => {
        const initializeAuth = async () => {
            const api = new APICore();
            const token = localStorage.getItem("token");
            if (token) {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decoded.exp > currentTime) {
                    setAuthorization(token);
                    const response = await api.me();
                    setUser(response.data.user);
                } else {
                    localStorage.removeItem("token");
                }
            }
        };

        initializeAuth();
    }, []);

    return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const Context = useContext(AuthContext);
    if (!Context) {
        throw new Error("useAuth must be used within a AuthProvider");
    }
    return Context;
};
