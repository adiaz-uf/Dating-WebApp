import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("userId"));

  useEffect(() => {
    if (!localStorage.getItem("userId")) {
      // Check session with backend
      fetch("/api/profile", { credentials: "include" })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Not logged in");
        })
        .then(data => {
          if (data && (data.profile?.id || data.id)) {
            localStorage.setItem("userId", data.profile?.id || data.id);
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        })
        .catch(() => setIsLoggedIn(false))
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  if (checking) return null;
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
