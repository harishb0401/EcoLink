import api from './api';
import { 
  saveCollectorSession, 
  getOfflineCollectorSession, 
  clearOfflineCollectorSession 
} from './offline/offlineSession';
import { isOnline } from './offline/networkStatus';

const TOKEN_KEY = 'ecolink_auth_token';
const USER_KEY = 'ecolink_user';

/**
 * SECURITY LIMITATIONS & ARCHITECTURE OF OFFLINE AUTHENTICATION:
 * 1. Passwords are NEVER stored locally in localStorage or IndexedDB.
 * 2. Initial authentication MUST happen online against the authoritative backend server.
 * 3. Offline sessions are permitted only for verified collectors with a valid prior session.
 * 4. Offline session validity is capped at a 7-day expiration window with version tracking.
 * 5. Logout explicitly purges both online tokens and offline session keys.
 */

export const authService = {
  /**
   * Log in user online and initialize offline session for collectors
   */
  async login(identifier, password, role = null) {
    if (!isOnline()) {
      throw new Error('Internet connection is required for initial login.');
    }

    const payload = {
      identifier: identifier.trim(),
      password,
      role
    };

    const response = await api.post('/auth/login', payload);

    if (response?.success && response?.data?.token) {
      const { token, user } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      // Cache offline collector session if role is collector
      if (user.role === 'collector') {
        saveCollectorSession(user, token).catch((err) => {
          console.warn('Failed to cache collector offline session:', err);
        });
      }

      return user;
    }

    throw new Error(response?.message || 'Login failed');
  },

  /**
   * Register new user (Collector or Recycler)
   */
  async register(registrationData) {
    if (!isOnline()) {
      throw new Error('Internet connection is required to register an account.');
    }

    const response = await api.post('/auth/register', registrationData);

    if (response?.success && response?.data?.token) {
      const { token, user } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      if (user.role === 'collector') {
        saveCollectorSession(user, token).catch((err) => {
          console.warn('Failed to cache collector offline session:', err);
        });
      }

      return user;
    }

    throw new Error(response?.message || 'Registration failed');
  },

  /**
   * Look up and verify official recycler registration number
   * Auto-fetches facility name and checks if already registered
   */
  async verifyRegistration(regNumber) {
    if (!regNumber || !regNumber.trim()) {
      return { success: false, message: 'Registration number is required.' };
    }

    try {
      const response = await api.get(`/auth/verify-registration?regNumber=${encodeURIComponent(regNumber.trim().toUpperCase())}`);
      return response;
    } catch (err) {
      if (err.data) {
        return err.data;
      }
      return {
        success: false,
        message: err.message || 'Error verifying registration number with registry.'
      };
    }
  },

  /**
   * Retrieve cached user object synchronously
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Fetch authenticated user identity from backend or fallback to offline collector session
   */
  async fetchCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);

    // If offline, check IndexedDB collector session before abandoning
    if (!isOnline()) {
      const offlineSession = await getOfflineCollectorSession();
      const isAuthOffline = offlineSession?.state === 'AUTHENTICATED_OFFLINE' || offlineSession?.status === 'AUTHENTICATED_OFFLINE';
      if (isAuthOffline && offlineSession?.user) {
        return {
          ...offlineSession.user,
          isOfflineSession: true
        };
      }
      return this.getCurrentUser();
    }

    if (!token) {
      // Check if collector has a valid offline session stored in IndexedDB
      const offlineSession = await getOfflineCollectorSession();
      const isAuthOffline = offlineSession?.state === 'AUTHENTICATED_OFFLINE' || offlineSession?.status === 'AUTHENTICATED_OFFLINE';
      if (isAuthOffline && offlineSession?.user) {
        return {
          ...offlineSession.user,
          isOfflineSession: true
        };
      }
      return null;
    }

    try {
      const response = await api.get('/auth/me');
      if (response?.success && response?.data?.user) {
        const user = response.data.user;
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        if (user.role === 'collector') {
          saveCollectorSession(user, token).catch(console.error);
        }

        return user;
      }
    } catch (err) {
      console.warn('Could not verify session with server:', err.message);

      // Check if network is offline or unreachable
      const offlineSession = await getOfflineCollectorSession();
      const isAuthOffline = offlineSession?.state === 'AUTHENTICATED_OFFLINE' || offlineSession?.status === 'AUTHENTICATED_OFFLINE';
      if (isAuthOffline && offlineSession?.user) {
        return {
          ...offlineSession.user,
          isOfflineSession: true
        };
      }

      // If strictly 401 Unauthorized from server, wipe invalid session
      if (err.status === 401 || (err.message && err.message.includes('401'))) {
        this.clearSession();
        await clearOfflineCollectorSession();
        return null;
      }

      // Preserve existing localStorage user if offline/network timeout
      return this.getCurrentUser();
    }
    return null;
  },

  /**
   * Log out user and purge both local and offline credentials
   * Pending offline records are preserved in IndexedDB
   */
  async logout() {
    try {
      if (isOnline()) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      this.clearSession();
      await clearOfflineCollectorSession();
    }
  },

  /**
   * Update profile on backend and refresh local storage
   */
  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    if (response?.success && response?.data?.user) {
      const user = response.data.user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    }
    throw new Error(response?.message || 'Failed to update profile');
  },

  /**
   * Clear local storage session
   */
  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Check if token exists
   */
  isAuthenticated() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },

  /**
   * Get raw token string
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }
};

export default authService;
