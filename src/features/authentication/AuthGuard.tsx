import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { localStorageUser, getUserToken } from '../../utils/localStorageUser';
import { useUser } from '../user/Hooks/useUsers';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const currentUser = localStorageUser();

  // All hooks must be called unconditionally
  const { data: userData, isLoading } = useUser(currentUser?.id);

  // Check if user exists in localStorage
  if (!currentUser?.id) {
    return <Navigate to="/login" replace />;
  }

  const authToken = getUserToken(currentUser.id);

  // Check token
  if (!authToken) {
    localStorage.removeItem('currentLocalUser');
    localStorage.removeItem(`token-${currentUser.id}`);
    return <Navigate to="/login" replace />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="border border-red-600 flex h-screen justify-center items-center">
        <Loader2 className="animate-spin text-brand-700 h-16 w-16" />
      </div>
    ); // Or your loading component
  }

  // Check if user is valid
  if (userData?.statusCode !== 200) {
    localStorage.removeItem('currentLocalUser');
    localStorage.removeItem(`token-${currentUser.id}`);
    return <Navigate to="/login" replace />;
  }

  // User is authenticated
  return <div className="-z-50">{children}</div>;
};

export default AuthGuard;
