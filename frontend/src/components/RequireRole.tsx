import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { LoadingBlock } from "./ui";
import type { UserRole } from "../types";

export function RequireRole({ role, children }: { role: UserRole | UserRole[]; children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingBlock />;
  if (!user) return <Navigate to="/login" replace />;
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
