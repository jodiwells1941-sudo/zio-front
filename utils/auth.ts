// Set authentication data in localStorage
interface User {
  [key: string]: any;
}

export const AUTH_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER: 'user',
  REFRESH_TOKEN: 'refresh_token'
};

const isBrowser = typeof window !== 'undefined';

const getStorage = () => {
  return isBrowser ? window.localStorage : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const storage = getStorage();
  const token = storage?.getItem(AUTH_KEYS.ACCESS_TOKEN);
  return !!token;
};

// Get access token from localStorage
export const getAccessToken = () => {
  const storage = getStorage();
  return storage?.getItem(AUTH_KEYS.ACCESS_TOKEN) ?? null;
};

// Get user info from localStorage
export const getUserInfo = () => {
  const storage = getStorage();
  const userStr = storage?.getItem(AUTH_KEYS.USER) ?? null;
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user info from localStorage:', error);
    return null;
  }
};

export const setAuthData = async (token: string, user: User, refreshToken: string | null = null): Promise<void> => {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(AUTH_KEYS.ACCESS_TOKEN, token);
  storage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
  
  if (refreshToken) {
    storage.setItem(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
  }
};

// Clear authentication data from localStorage
export const clearAuthData = async (): Promise<void> => {
  const storage = getStorage();
  if (!storage) return;

  storage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
  storage.removeItem(AUTH_KEYS.USER);
  storage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
};

// Login function (to be called after successful API login)
export const login = async (token: string, user: User, refreshToken: string | null = null): Promise<void> => {
  await setAuthData(token, user, refreshToken);
  // Trigger a custom event to notify components about auth state change
  if (isBrowser) {
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { isAuthenticated: true, user } }));
  }
};

// Logout function
export const logout = async () => {
  await clearAuthData();
  // Trigger a custom event to notify components about auth state change
  if (isBrowser) {
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { isAuthenticated: false, user: null } }));
    // Redirect to home page
    window.location.href = '/';
  }
};

// Get refresh token
export const getRefreshToken = () => {
  const storage = getStorage();
  return storage?.getItem(AUTH_KEYS.REFRESH_TOKEN) ?? null;
};