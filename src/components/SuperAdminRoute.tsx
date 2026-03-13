import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/** Renders children only for super admins; otherwise redirects to home. */
export function SuperAdminRoute({ children }: { children: React.ReactNode }) {
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

  if (user?.isSuperAdmin !== true) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
