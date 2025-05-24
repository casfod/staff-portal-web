import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { localStorageUser, getUserToken } from "../../utils/localStorageUser";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const currentUser = localStorageUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const authToken = getUserToken(currentUser.id);

  if (!authToken) {
    localStorage.removeItem("currentLocalUser");
    localStorage.removeItem(`token-${currentUser.id}`);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
