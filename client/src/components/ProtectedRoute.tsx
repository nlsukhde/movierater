// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Optionally, you might want to decode and validate the token here
  // to check for expiration or other claims before granting access.

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
