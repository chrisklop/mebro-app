import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../lib/auth';
import { colors, spacing, borderRadius, shadows } from '../lib/design';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (mode !== 'forgot' && !password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError(null);

    if (mode === 'forgot') {
      const { error } = await resetPassword(email.trim());
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setResetSent(true);
      }
      return;
    }

    const { error } = mode === 'login'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.replace('/');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={{
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
      }}>
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.xl,
          }}
        >
          <ArrowLeft color={colors.textPrimary} size={24} />
          <Text style={{
            marginLeft: spacing.sm,
            fontSize: 16,
            color: colors.textPrimary,
          }}>
            Back
          </Text>
        </Pressable>

        {/* Header */}
        <View style={{ marginBottom: spacing.xxl }}>
          <Text style={{
            fontSize: 32,
            fontWeight: '800',
            color: colors.textPrimary,
            marginBottom: spacing.xs,
          }}>
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
          </Text>
          <Text style={{
            fontSize: 16,
            color: colors.textSecondary,
          }}>
            {mode === 'login'
              ? 'Sign in to get 15 fact checks per day'
              : mode === 'signup'
              ? 'Sign up to unlock more fact checks'
              : "Enter your email and we'll send you a reset link"}
          </Text>
        </View>

        {/* Form */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          ...shadows.md,
        }}>
          {/* Reset sent success */}
          {mode === 'forgot' && resetSent ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
              <CheckCircle color={colors.verdictTrue} size={48} />
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.textPrimary,
                marginTop: spacing.md,
                marginBottom: spacing.xs,
              }}>
                Check your email
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
                marginBottom: spacing.lg,
              }}>
                We sent a password reset link to {email}
              </Text>
              <Pressable
                onPress={() => {
                  setMode('login');
                  setResetSent(false);
                  setError(null);
                }}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.lg,
                  borderRadius: borderRadius.md,
                }}
              >
                <Text style={{ color: colors.textOnDark, fontWeight: '600' }}>
                  Back to Sign In
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              {/* Email input */}
              <View style={{ marginBottom: spacing.md }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.textSecondary,
                  marginBottom: spacing.xs,
                }}>
                  Email
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.backgroundAlt,
                  borderRadius: borderRadius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: spacing.md,
                }}>
                  <Mail color={colors.textMuted} size={20} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                      flex: 1,
                      marginLeft: spacing.sm,
                      paddingVertical: spacing.md,
                      fontSize: 16,
                      color: colors.textPrimary,
                    }}
                  />
                </View>
              </View>

              {/* Password input - only show for login/signup */}
              {mode !== 'forgot' && (
                <View style={{ marginBottom: spacing.sm }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.textSecondary,
                    marginBottom: spacing.xs,
                  }}>
                    Password
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.backgroundAlt,
                    borderRadius: borderRadius.md,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingHorizontal: spacing.md,
                  }}>
                    <Lock color={colors.textMuted} size={20} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter password"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      style={{
                        flex: 1,
                        marginLeft: spacing.sm,
                        paddingVertical: spacing.md,
                        fontSize: 16,
                        color: colors.textPrimary,
                      }}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff color={colors.textMuted} size={20} />
                      ) : (
                        <Eye color={colors.textMuted} size={20} />
                      )}
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Forgot password link - only show on login */}
              {mode === 'login' && (
                <Pressable
                  onPress={() => {
                    setMode('forgot');
                    setError(null);
                  }}
                  style={{ marginBottom: spacing.md }}
                >
                  <Text style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    textAlign: 'right',
                  }}>
                    Forgot password?
                  </Text>
                </Pressable>
              )}

              {mode !== 'login' && <View style={{ marginBottom: spacing.sm }} />}

              {/* Error message */}
              {error && (
                <View style={{
                  backgroundColor: colors.verdictFalse + '20',
                  padding: spacing.sm,
                  borderRadius: borderRadius.sm,
                  marginBottom: spacing.md,
                }}>
                  <Text style={{ color: colors.verdictFalse, fontSize: 14 }}>
                    {error}
                  </Text>
                </View>
              )}

              {/* Submit button */}
              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={{
                  backgroundColor: loading ? colors.border : colors.primary,
                  paddingVertical: spacing.md,
                  borderRadius: borderRadius.md,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.textOnDark,
                }}>
                  {loading
                    ? 'Please wait...'
                    : mode === 'login'
                    ? 'Sign In'
                    : mode === 'signup'
                    ? 'Create Account'
                    : 'Send Reset Link'}
                </Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Toggle mode */}
        {mode !== 'forgot' || !resetSent ? (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: spacing.lg,
          }}>
            {mode === 'forgot' ? (
              <Pressable onPress={() => {
                setMode('login');
                setError(null);
              }}>
                <Text style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  Back to Sign In
                </Text>
              </Pressable>
            ) : (
              <>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                </Text>
                <Pressable onPress={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError(null);
                }}>
                  <Text style={{
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontWeight: '600',
                  }}>
                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        ) : null}

        {/* Benefits */}
        <View style={{
          marginTop: spacing.xxl,
          padding: spacing.lg,
          backgroundColor: colors.surfaceDark,
          borderRadius: borderRadius.lg,
        }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.textOnDark,
            marginBottom: spacing.sm,
          }}>
            Why create an account?
          </Text>
          <Text style={{ color: colors.textOnDarkMuted, fontSize: 13, lineHeight: 20 }}>
            {'\u2022'} Get 15 free fact checks per day (vs 5 for guests){'\n'}
            {'\u2022'} Save your fact check history{'\n'}
            {'\u2022'} Unlock Plus (50/day) or Pro (150/day) plans
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
