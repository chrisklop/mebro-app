import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../lib/auth';
import { colors, spacing, borderRadius, shadows } from '../lib/design';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

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
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </Text>
          <Text style={{
            fontSize: 16,
            color: colors.textSecondary,
          }}>
            {mode === 'login'
              ? 'Sign in to get 15 fact checks per day'
              : 'Sign up to unlock more fact checks'}
          </Text>
        </View>

        {/* Form */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          ...shadows.md,
        }}>
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

          {/* Password input */}
          <View style={{ marginBottom: spacing.lg }}>
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
                : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Text>
          </Pressable>
        </View>

        {/* Toggle mode */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: spacing.lg,
        }}>
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
        </View>

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
