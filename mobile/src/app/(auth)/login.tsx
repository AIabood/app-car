/**
 * Login Screen
 * User authentication
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/api';
import { validateEmail2, validatePassword } from '@/utils/validation';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    // Validate fields before hitting the network
    const emailErr = validateEmail2(email);
    const passwordErr = validatePassword(password);

    if (emailErr) setEmailError(emailErr);
    if (passwordErr) setPasswordError(passwordErr);

    if (emailErr || passwordErr) {
      return;
    }

    try {
      await login(email, password);
      router.replace('/(app)');
    } catch (error) {
      if (error instanceof ApiError) {
        // Surface the exact backend message (e.g. "Invalid credentials")
        setGeneralError(error.message);
      } else if (error instanceof Error) {
        setGeneralError(error.message);
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleForgotPassword = () => {
    alert('Password reset will be available soon.');
  };

  const handleCreateAccount = () => {
    router.push('/(auth)/register');
  };

  const handleGoogleSignIn = () => {
    alert('Google Sign-In will be available soon.');
  };

  return (
    <Screen scrollable keyboardAvoiding>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
      </View>

      {generalError && <ErrorMessage message={generalError} />}

      <View style={styles.form}>
        <AppInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <AppInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          secureTextEntry
          editable={!loading}
          style={styles.inputSpacing}
        />

        <AppButton
          title="Forgot password?"
          onPress={handleForgotPassword}
          variant="outline"
          style={styles.forgotButton}
        />
      </View>

      <AppButton
        title="Sign In"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        style={styles.signInButton}
      />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <AppButton
        title="Continue with Google"
        onPress={handleGoogleSignIn}
        variant="secondary"
        disabled={loading}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don&apos;t have an account?</Text>
        <AppButton
          title="Create Account"
          onPress={handleCreateAccount}
          variant="outline"
          disabled={loading}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputSpacing: {
    marginTop: spacing.lg,
  },
  forgotButton: {
    marginTop: spacing.md,
    height: 40,
  },
  signInButton: {
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});
