import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { localStorageUser, getUserToken } from "../../utils/localStorageUser";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const localStorageUserX = localStorageUser();

  if (!localStorageUserX) {
    return <Navigate to="/login" replace />;
  }

  const authToken = getUserToken(localStorageUserX.id);

  if (!authToken) {
    localStorage.removeItem("currentLocalUser");
    localStorage.removeItem(`token-${localStorageUserX.id}`);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
