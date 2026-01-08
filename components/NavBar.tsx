import { View, Text, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { colors, spacing, shadows, borderRadius } from '../lib/design';

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
      }}>
        {/* Logo */}
        <Pressable
          onPress={() => router.push('/')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
        >
          {/* Logo mark - black square */}
          <View style={{
            width: 36,
            height: 36,
            borderRadius: borderRadius.sm,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '900',
              color: colors.textOnDark,
            }}>
              M
            </Text>
          </View>

          {/* Wordmark */}
          <Text style={{
            fontSize: 22,
            fontWeight: '700',
            color: colors.textPrimary,
            letterSpacing: -0.5,
          }}>
            mebro
          </Text>
        </Pressable>

        {/* Right side */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          {!isHome && (
            <Pressable
              onPress={() => router.push('/')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                backgroundColor: colors.primary,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm + 2,
                borderRadius: borderRadius.full,
              }}
            >
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.verdictTrue,
              }} />
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.textOnDark,
              }}>
                New Check
              </Text>
            </Pressable>
          )}

          {/* Empty on home - logo speaks for itself */}
        </View>
      </View>
    </View>
  );
}
