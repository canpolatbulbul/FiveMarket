import React from 'react';
import { Navigate } from 'react-router-dom';
import { getClearanceLevel, hasClearance } from '../helpers/roles.js';
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
        return <Navigate to="/login" />;
    }

    // If specific role is required, check exact match
    if (requiredRole) {
        if (user.role?.toLowerCase() !== requiredRole.toLowerCase()) {
            return <Navigate to="/forbidden" />;
        }
        return children;
    }

    // Otherwise check clearance level
    if (requiredClearance) {
        const userClearance = getClearanceLevel(user.role);
        if (!hasClearance(userClearance, requiredClearance)) {
            return <Navigate to="/forbidden" />;
        }
    }

    return children;
};

export default ProtectedRoute;
