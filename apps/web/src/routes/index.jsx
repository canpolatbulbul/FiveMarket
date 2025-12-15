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
const MyServicesPage = lazy(() => import("../pages/Service/MyServicesPage.jsx"));
const OrderServicePage = lazy(() => import("../pages/Order/OrderServicePage.jsx"));
const ClientOrdersPage = lazy(() => import("../pages/Order/ClientOrdersPage.jsx"));
const FreelancerOrdersPage = lazy(() => import("../pages/Order/FreelancerOrdersPage.jsx"));
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
            path: "/service/:id",
            element: <ProtectedRoute><LoadComponent component={ServiceDetailPage} /></ProtectedRoute>
        },
        {
            path: "/service/:serviceId/order",
            element: <ProtectedRoute><LoadComponent component={OrderServicePage} /></ProtectedRoute>
        },
        {
            path: "/my-orders",
            element: <ProtectedRoute requiredRole={Roles.CLIENT}><LoadComponent component={ClientOrdersPage} /></ProtectedRoute>
        },
        {
            path: "/my-sales",
            element: <ProtectedRoute requiredRole={Roles.FREELANCER}><LoadComponent component={FreelancerOrdersPage} /></ProtectedRoute>
        },
        {
            path: "/orders/:id",
            element: <ProtectedRoute><LoadComponent component={OrderDetailPage} /></ProtectedRoute>
        },
        {
            path: "/messages",
            element: <ProtectedRoute><LoadComponent component={MessagesPage} /></ProtectedRoute>
        },
        {
            path: "/messages/:id",
            element: <ProtectedRoute><LoadComponent component={ConversationPage} /></ProtectedRoute>
        },
        {
            path: "/disputes",
            element: <ProtectedRoute><LoadComponent component={DisputesPage} /></ProtectedRoute>
        },
        {
            path: "/disputes/:id",
            element: <ProtectedRoute><LoadComponent component={DisputeDetailPage} /></ProtectedRoute>
        },
        {
            path: "/admin/disputes",
            element: <ProtectedRoute><LoadComponent component={AdminDisputesPage} /></ProtectedRoute>
        },
        {
            path: "/admin/orders",
            element: <ProtectedRoute><LoadComponent component={AdminOrdersPage} /></ProtectedRoute>
        },
        {
            path: "/admin/users",
            element: <ProtectedRoute><LoadComponent component={AdminUsersPage} /></ProtectedRoute>
        },
        {
            path: "/my-services",
            element: <ProtectedRoute><LoadComponent component={MyServicesPage} /></ProtectedRoute>
        },
        {
            path: "/services/create",
            element: <ProtectedRoute><LoadComponent component={AddServicePage} /></ProtectedRoute>
        },
        {
            path: "/services/edit/:id",
            element: <ProtectedRoute><LoadComponent component={EditServicePage} /></ProtectedRoute>
        },
        {
            path:"/profile",
            element: <ProtectedRoute><LoadComponent component={ProfilePage} /></ProtectedRoute>
        },
        {
            path: "/auth",
            children:[
                {path:"register",element: <LoadComponent component={Register} />},
                {path:"login",element: <LoadComponent component={Login} />},
                {path:"forgot-password",element: <LoadComponent component={ForgotPassword} />},
                {path:"reset-password",element: <LoadComponent component={ResetPassword} />},
                {path:"logout",element: <ProtectedRoute><LoadComponent component={Logout} /></ProtectedRoute>}
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