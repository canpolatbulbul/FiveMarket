import React, {lazy, Suspense} from "react";
import {useRoutes, Navigate} from "react-router-dom";
import {useAuth} from "@/contexts/AuthContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import {Roles} from "@/helpers/roles.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const LandingPage = lazy(() => import("../pages/Home/LandingPage.jsx"));
const HomePage = lazy(() => import("../pages/Home/HomePage.jsx"));
const BrowsePage = lazy(() => import("../pages/Browse/BrowsePage.jsx"));
const ServiceDetailPage = lazy(() => import("../pages/Service/ServiceDetailPage.jsx"));
const AddServicePage = lazy(() => import("../pages/Service/AddServicePage.jsx"));
const Register = lazy(() => import("../pages/Auth/Register.jsx"));
const Login = lazy(() => import("../pages/Auth/Login.jsx"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword.jsx"));
const TermsAndConditions = lazy(() => import("../pages/Legal/TermsAndConditions.jsx"));
const PrivacyPolicy = lazy(() => import("../pages/Legal/PrivacyPolicy.jsx"));
const Logout = lazy(() => import("../pages/Auth/Logout.jsx"));

const LoadComponent = ({component: Component}) => (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Component />
    </Suspense>
);

const AllRoutes = () => {
    const { user } = useAuth();
    
    return useRoutes([
        {
            path: "/",
            element: user ? <LoadComponent component={HomePage} /> : <LoadComponent component={LandingPage} />
        },
        {
            path: "/browse",
            element: <LoadComponent component={BrowsePage} />
        },
        {
            path: "/service/:id",
            element: <LoadComponent component={ServiceDetailPage} />
        },
        {
            path: "/services/create",
            element: <LoadComponent component={AddServicePage} />
        },
        {
            path: "/auth",
            children:[
                {path:"register",element: <LoadComponent component={Register} />},
                {path:"login",element: <LoadComponent component={Login} />},
                {path:"forgot-password",element: <LoadComponent component={ForgotPassword} />},
                {path:"reset-password",element: <LoadComponent component={ResetPassword} />},
                {path:"logout",element: <LoadComponent component={Logout} />}
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