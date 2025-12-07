import {BrowserRouter} from "react-router-dom";

// routes
import AllRoutes from "./index.jsx";
import {AuthProvider} from "@/contexts/AuthContext.jsx";

const Routes = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AllRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
};

export default Routes;
