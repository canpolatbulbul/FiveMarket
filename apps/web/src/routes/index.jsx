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
const EditServicePage = lazy(() => import("../pages/Service/EditServicePage.jsx"));
const OrderServicePage = lazy(() => import("../pages/Order/OrderServicePage.jsx"));
const ClientOrdersPage = lazy(() => import("../pages/Order/ClientOrdersPage.jsx"));
const OrderDetailPage = lazy(() => import("../pages/Order/OrderDetailPage.jsx"));
const MessagesPage = lazy(() => import("../pages/Messages/MessagesPage.jsx"));
const ConversationPage = lazy(() => import("../pages/Messages/ConversationPage.jsx"));
const DisputesPage = lazy(() => import("../pages/Dispute/DisputesPage.jsx"));
const DisputeDetailPage = lazy(() => import("../pages/Dispute/DisputeDetailPage.jsx"));
const AdminDisputesPage = lazy(() => import("../pages/Admin/AdminDisputesPage.jsx"));
const AdminOrdersPage = lazy(() => import("../pages/Admin/AdminOrdersPage.jsx"));
const AdminUsersPage = lazy(() => import("../pages/Admin/AdminUsersPage.jsx"));
const Register = lazy(() => import("../pages/Auth/Register.jsx"));
const Login = lazy(() => import("../pages/Auth/Login.jsx"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword.jsx"));
const TermsAndConditions = lazy(() => import("../pages/Legal/TermsAndConditions.jsx"));
const PrivacyPolicy = lazy(() => import("../pages/Legal/PrivacyPolicy.jsx"));
const Logout = lazy(() => import("../pages/Auth/Logout.jsx"));
const ProfilePage = lazy(() => import("../pages/Profile/ProfilePage.jsx"));
const FreelancerDashboard = lazy(() => import("../pages/Freelancer/FreelancerDashboard.jsx"));
const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard.jsx"));
const ForbiddenPage = lazy(() => import("../pages/Error/ForbiddenPage.jsx"));

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
            element: <ProtectedRoute><LoadComponent component={BrowsePage} /></ProtectedRoute>
        },
        {
            path: "/profile",
            element: <ProtectedRoute><LoadComponent component={ProfilePage} /></ProtectedRoute>
        },
        // Service routes
        {
            path: "/service",
            children: [
                {
                    path: ":id",
                    element: <ProtectedRoute><LoadComponent component={ServiceDetailPage} /></ProtectedRoute>
                },
                {
                    path: ":serviceId/order",
                    element: <ProtectedRoute><LoadComponent component={OrderServicePage} /></ProtectedRoute>
                }
            ]
        },
        {
            path: "/services",
            children: [
                {
                    path: "create",
                    element: <ProtectedRoute><LoadComponent component={AddServicePage} /></ProtectedRoute>
                },
                {
                    path: "edit/:id",
                    element: <ProtectedRoute><LoadComponent component={EditServicePage} /></ProtectedRoute>
                }
            ]
        },
        // Order routes
        {
            path: "/orders",
            children: [
                {
                    path: ":id",
                    element: <ProtectedRoute><LoadComponent component={OrderDetailPage} /></ProtectedRoute>
                }
            ]
        },
        {
            path: "/my-orders",
            element: <ProtectedRoute requiredRole={Roles.CLIENT}><LoadComponent component={ClientOrdersPage} /></ProtectedRoute>
        },
        // Message routes
        {
            path: "/messages",
            children: [
                {
                    index: true,
                    element: <ProtectedRoute><LoadComponent component={MessagesPage} /></ProtectedRoute>
                },
                {
                    path: ":id",
                    element: <ProtectedRoute><LoadComponent component={ConversationPage} /></ProtectedRoute>
                }
            ]
        },
        // Dispute routes
        {
            path: "/disputes",
            children: [
                {
                    index: true,
                    element: <ProtectedRoute><LoadComponent component={DisputesPage} /></ProtectedRoute>
                },
                {
                    path: ":id",
                    element: <ProtectedRoute><LoadComponent component={DisputeDetailPage} /></ProtectedRoute>
                }
            ]
        },
        // Admin routes
        {
            path: "/admin",
            children: [
                { path: "dashboard", element: <ProtectedRoute requiredRole={Roles.ADMIN}><LoadComponent component={AdminDashboard} /></ProtectedRoute>},
                {
                    path: "disputes",
                    element: <ProtectedRoute><LoadComponent component={AdminDisputesPage} /></ProtectedRoute>
                },
                {
                    path: "orders",
                    element: <ProtectedRoute><LoadComponent component={AdminOrdersPage} /></ProtectedRoute>
                },
                { path: "users", element: <ProtectedRoute><LoadComponent component={AdminUsersPage} /></ProtectedRoute>}
            ]
        },
        // Freelancer routes
        {
            path: "/freelancer",
            children: [
                { path: "dashboard", element: <ProtectedRoute requiredRole={Roles.FREELANCER}><LoadComponent component={FreelancerDashboard} /></ProtectedRoute>}
            ]
        },
        // Auth routes
        {
            path: "/auth",
            children: [
                { path: "register", element: <LoadComponent component={Register} /> },
                { path: "login", element: <LoadComponent component={Login} /> },
                { path: "forgot-password", element: <LoadComponent component={ForgotPassword} /> },
                { path: "reset-password", element: <LoadComponent component={ResetPassword} /> },
                { path: "logout", element: <ProtectedRoute><LoadComponent component={Logout} /></ProtectedRoute> }
            ]
        },
        // Legal routes
        {
            path: "/legal",
            children: [
                { path: "terms", element: <LoadComponent component={TermsAndConditions} /> },
                { path: "privacy", element: <LoadComponent component={PrivacyPolicy} /> }
            ]
        },
        {
            path: "/forbidden",
            element: <LoadComponent component={ForbiddenPage} />
        },
        {
            path: "*",
            element: <Navigate to="/" />
        }
    ])
}

export default AllRoutes;