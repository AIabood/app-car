/**
 * Root Layout
 * Authentication-aware routing for the entire app
 */

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { colors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.white,
        },
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen
          name="(app)"
          options={{}}
        />
      ) : (
        <Stack.Screen
          name="(auth)"
          options={{}}
        />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
