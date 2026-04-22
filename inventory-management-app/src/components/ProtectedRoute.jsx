import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getUser, isAuthenticated } from "../utils/auth";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const token = isAuthenticated();
  const user = getUser();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
