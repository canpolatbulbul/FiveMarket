import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasClearance } from '../helpers/roles.js';
import { useAuth } from "@/contexts/AuthContext.jsx";

/**
 * ProtectedRoute component for role-based access control
 * @param {React.ReactNode} children - Component to render if authorized
 * @param {number} requiredClearance - Minimum clearance level required (1-3)
 * @param {string} requiredRole - Specific role required (optional, overrides clearance check)
 */
const ProtectedRoute = ({ children, requiredClearance, requiredRole }) => {
    const { user } = useAuth();

    // Check if user is authenticated
    if (!user) {
        return <Navigate to="/auth/login" />;
    }

    // If specific role is required, check if user has that role in their roles array
    if (requiredRole) {
        const hasAccess = user.roles?.some(
            role => role.toLowerCase() === requiredRole.toLowerCase()
        );
        
        if (!hasAccess) {
            return <Navigate to="/forbidden" />;
        }
        return children;
    }

    // Otherwise check clearance level using the clearance value from backend
    if (requiredClearance) {
        if (!hasClearance(user.clearance, requiredClearance)) {
            return <Navigate to="/forbidden" />;
        }
    }

    return children;
};

export default ProtectedRoute;
