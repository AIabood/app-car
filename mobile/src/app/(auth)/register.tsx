/**
 * Register Screen
 * New user registration
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
import {
  validateName,
  validateEmail2,
  validatePassword,
} from '@/utils/validation';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const handleRegister = async () => {
    // Reset errors
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');

    // Validate
    const nameErr = validateName(name);
    const emailErr = validateEmail2(email);
    const passwordErr = validatePassword(password);
    let confirmPasswordErr = '';

    if (password !== confirmPassword) {
      confirmPasswordErr = 'Passwords do not match';
    }

    if (nameErr) setNameError(nameErr);
    if (emailErr) setEmailError(emailErr);
    if (passwordErr) setPasswordError(passwordErr);
    if (confirmPasswordErr) setConfirmPasswordError(confirmPasswordErr);

    if (nameErr || emailErr || passwordErr || confirmPasswordErr) {
      return;
    }

    try {
      await register(name, email, password);
      router.replace('/(app)');
    } catch (error) {
      setGeneralError('Registration failed. Please try again.');
    }
  };

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  const handleGoogleSignIn = () => {
    alert('Google Sign-In will be available soon.');
  };

  return (
    <Screen scrollable keyboardAvoiding>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
      </View>

      {generalError && <ErrorMessage message={generalError} />}

      <View style={styles.form}>
        <AppInput
          label="Full Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          error={nameError}
          editable={!loading}
        />

        <AppInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
          style={styles.inputSpacing}
        />

        <AppInput
          label="Password"
          placeholder="Create password"
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          secureTextEntry
          editable={!loading}
          style={styles.inputSpacing}
        />

        <AppInput
          label="Confirm Password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={confirmPasswordError}
          secureTextEntry
          editable={!loading}
          style={styles.inputSpacing}
        />
      </View>

      <AppButton
        title="Create Account"
        onPress={handleRegister}
        loading={loading}
        disabled={loading}
        style={styles.createButton}
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
        <Text style={styles.footerText}>Already have an account?</Text>
        <AppButton
          title="Sign In"
          onPress={handleSignIn}
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
  createButton: {
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
