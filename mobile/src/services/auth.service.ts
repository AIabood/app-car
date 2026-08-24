/**
 * Authentication Service
 * All auth-related API calls go through this module.
 * Matches the actual backend response shapes from auth.routes.ts.
 */

import { apiRequest } from './api';

// ─── Types matching the Prisma User model fields returned by the backend ────

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'DRIVER' | 'ADMIN';
  /** Only present on GET /me */
  language?: string;
  darkMode?: boolean;
  alertMargin?: number;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  /** Must be min 2 chars — maps to the fullName field in the database */
  fullName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MeResponse {
  user: User;
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Returns {user, token} on success (status 201).
 * Throws ApiError(409) if the email is already registered.
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: data,
  });
}

/**
 * POST /api/auth/login
 * Returns {user, token} on success.
 * Throws ApiError(401) for invalid credentials.
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: data,
  });
}

/**
 * GET /api/auth/me
 * Returns {user} with extended profile fields.
 * Throws ApiError(401) if the token is invalid or expired.
 */
export async function getCurrentUser(token: string): Promise<User> {
  const response = await apiRequest<MeResponse>('/auth/me', {
    method: 'GET',
    token,
  });
  return response.user;
}
