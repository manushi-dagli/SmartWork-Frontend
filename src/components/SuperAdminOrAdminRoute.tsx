import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/** Renders children only for super admins or ADMIN role; otherwise redirects to home. Use for task config. */
export function SuperAdminOrAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isPending } = useAuth();
  const location = useLocation();

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const allowed = user?.isSuperAdmin === true || user?.roleValue === "ADMIN";
  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
