import { View, Text, Pressable, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { User, Plus, Shield } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth';
import { colors, spacing, borderRadius } from '../lib/design';

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user, usage } = useAuth();
  const isHome = pathname === '/';
  const isLogin = pathname === '/login';

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingTop: Platform.OS === 'ios' ? insets.top : spacing.sm,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 44,
      }}>
        {/* Left side - Logo or Privacy link on home */}
        {isHome ? (
          <Pressable
            onPress={() => router.push('/privacy')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(184, 173, 143, 0.5)',
              paddingHorizontal: spacing.sm + 4,
              paddingVertical: spacing.xs + 2,
              borderRadius: 20,
              gap: 6,
            }}
          >
            <Shield color={colors.textMuted} size={12} />
            <Text style={{
              fontSize: 12,
              fontWeight: '500',
              color: colors.textMuted,
            }}>
              Privacy
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push('/')}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <View style={{
              width: 32,
              height: 32,
              borderRadius: borderRadius.sm,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.xs,
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '900',
                color: colors.textOnDark,
              }}>
                M
              </Text>
            </View>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: colors.textPrimary,
              letterSpacing: -0.5,
            }}>
              mebro
            </Text>
          </Pressable>
        )}

        {/* Right side */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {/* New Check button (when not on home) */}
          {!isHome && !isLogin && (
            <Pressable
              onPress={() => router.push('/')}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.backgroundAlt,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plus color={colors.textPrimary} size={20} />
            </Pressable>
          )}

          {/* User button with usage indicator */}
          <Pressable
            onPress={() => router.push(user ? '/account' : '/login')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.primary,
              paddingLeft: spacing.sm,
              paddingRight: spacing.sm + 2,
              paddingVertical: spacing.xs,
              borderRadius: borderRadius.lg,
              gap: spacing.xs,
            }}
          >
            <User color={colors.textOnDark} size={18} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '700',
                color: colors.textOnDark,
                lineHeight: 16,
              }}>
                {usage.remaining}/{usage.limit}
              </Text>
              <Text style={{
                fontSize: 9,
                fontWeight: '500',
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: 0.5,
                lineHeight: 10,
              }}>
                credits
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
