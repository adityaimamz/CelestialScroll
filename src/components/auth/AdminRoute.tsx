import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { BarLoader } from "@/components/ui/BarLoader";

export function AdminRoute() {
  const { user, loading, isAdmin, userRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <BarLoader />      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only allow admin or moderator
  if (!isAdmin && userRole !== "moderator") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
