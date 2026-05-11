import { useEffect, useState } from 'react';
import { getUserInfo, isAuthenticated } from '../utils/auth';

// Custom hook for authentication state management
export const useAuth = () => {
  const [user, setUser] = useState(getUserInfo());
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const authenticated = isAuthenticated();
      const userInfo = getUserInfo();
      setIsLoggedIn(authenticated);
      setUser(userInfo);
      setIsLoading(false);
    };

    checkAuthStatus();

    // Listen for auth state changes
    interface AuthStateChangeDetail {
      isAuthenticated: boolean;
      user: ReturnType<typeof getUserInfo>;
    }

    interface AuthStateChangedEvent extends CustomEvent<AuthStateChangeDetail> {}

    const handleAuthStateChange = (event: Event): void => {
      const { isAuthenticated: authenticated, user: userInfo } = (event as AuthStateChangedEvent).detail;
      setIsLoggedIn(authenticated);
      setUser(userInfo);
    };

    window.addEventListener('authStateChanged', handleAuthStateChange);

    // Cleanup event listener
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
    };
  }, []);

  return {
    user,
    isLoggedIn,
    isLoading
  };
};