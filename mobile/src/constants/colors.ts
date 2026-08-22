/**
 * AppCar Design System - Colors
 * Premium automotive-inspired color palette
 */

export const colors = {
  // Primary brand colors
  primary: '#007AFF', // Accent Blue
  primaryDark: '#0051CC',
  
  // Neutral palette
  white: '#FFFFFF',
  black: '#000000',
  darkNavy: '#0F1419', // Dark Navy
  darkGray: '#1C1E23', // Dark Gray for backgrounds
  mediumGray: '#6B7280', // Medium Gray
  lightGray: '#F3F4F6', // Light Gray
  
  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Text colors
  text: '#000000',
  textSecondary: '#6B7280',
  textInverse: '#FFFFFF',
  
  // Background colors
  background: '#FFFFFF',
  surfaceLight: '#F9FAFB',
  surface: '#F3F4F6',
  surfaceDark: '#E5E7EB',
  
  // Border colors
  border: '#E5E7EB',
  borderDark: '#D1D5DB',
  
  // Dark mode palette
  darkBackground: '#0F1419',
  darkSurface: '#1C1E23',
  darkSurfaceLight: '#2D3139',
  darkText: '#FFFFFF',
  darkTextSecondary: '#9CA3AF',
  darkBorder: '#374151',
} as const;

export type ColorKey = keyof typeof colors;
