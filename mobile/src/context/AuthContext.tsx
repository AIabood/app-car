/**
 * Authentication Context
 * Real backend-integrated authentication state management.
 * Persists the JWT token in AsyncStorage for session restoration.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '@/services/auth.service';
import { ApiError } from '@/services/api';

const TOKEN_KEY = '@appcar_auth_token';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  /** Display name — maps to fullName from the backend */
  name: string;
  fullName: string;
  role: 'DRIVER' | 'ADMIN';
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  /** True while checking AsyncStorage / calling the backend on startup */
  isLoading: boolean;
  /** True while a login / register / logout call is in-flight */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapUser(backendUser: authService.User): AuthUser {
  return {
    id: backendUser.id,
    email: backendUser.email,
    fullName: backendUser.fullName,
    name: backendUser.fullName,
    role: backendUser.role,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = user !== null && token !== null;

  // ── Session restoration on startup ─────────────────────────────────────────
  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);

        if (!storedToken) {
          // No token stored — send user to login
          return;
        }

        // Validate token by fetching the current user
        const backendUser = await authService.getCurrentUser(storedToken);
        setToken(storedToken);
        setUser(mapUser(backendUser));
      } catch (error) {
        // Token invalid or expired — clear it
        await AsyncStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  // ── login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(mapUser(response.user));
    } catch (error) {
      if (error instanceof ApiError) {
        // Re-throw so the screen can display the backend message
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── register ────────────────────────────────────────────────────────────────
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        // Backend uses `fullName` field
        const response = await authService.register({
          fullName: name,
          email,
          password,
        });
        // Backend returns a token on registration — auto-authenticate
        await AsyncStorage.setItem(TOKEN_KEY, response.token);
        setToken(response.token);
        setUser(mapUser(response.user));
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }
        throw new Error('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ── logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        isLoading,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
