import React, {Suspense} from "react";
import {useRoutes, Navigate} from "react-router-dom";
import {useAuth} from "@/contexts/AuthContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import {Roles} from "@/helpers/roles.js";

const Register = React.lazy(() => import("@/pages/Auth/Register.jsx"));
const Login = React.lazy(() => import("@/pages/Auth/Login.jsx"));
const ForgotPassword = React.lazy(() => import("@/pages/Auth/ForgotPassword.jsx"));
const TermsAndConditions = React.lazy(() => import("@/pages/Legal/TermsAndConditions.jsx"));
const PrivacyPolicy = React.lazy(() => import("@/pages/Legal/PrivacyPolicy.jsx"));

const loading = () => <div>Loading...</div>;

const LoadComponent = ({component: Component}) => (
    <Suspense fallback={loading()}>
        <Component />
    </Suspense>
);

const AllRoutes = () => {
    return useRoutes([
        {
            path: "/",
            element: <Navigate to="/auth/register" />
        },
        {
            path: "/auth",
            children:[
                {path:"register",element: <LoadComponent component={Register} />},
                {path:"login",element: <LoadComponent component={Login} />},
                {path:"forgot-password",element: <LoadComponent component={ForgotPassword} />}
            ]
        },
        {
            path: "/legal",
            children:[
                {path:"terms",element: <LoadComponent component={TermsAndConditions} />},
                {path:"privacy",element: <LoadComponent component={PrivacyPolicy} />}
            ]
        },
        {
            path: "*",
            element: <Navigate to="/" />
        }
    ])
}

export default AllRoutes;