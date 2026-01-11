import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/auth';
import { colors, spacing, borderRadius } from '../lib/design';

export function UsageBadge() {
  const router = useRouter();
  const { usage, user } = useAuth();

  const getProgressColor = () => {
    const ratio = usage.remaining / usage.limit;
    if (ratio > 0.5) return colors.verdictTrue;
    if (ratio > 0.2) return colors.verdictMixed;
    return colors.verdictFalse;
  };

  const handlePress = () => {
    if (!user) {
      router.push('/login');
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundAlt,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Progress bar */}
      <View style={{
        width: 40,
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        marginRight: spacing.xs,
        overflow: 'hidden',
      }}>
        <View style={{
          width: `${(usage.remaining / usage.limit) * 100}%`,
          height: '100%',
          backgroundColor: getProgressColor(),
          borderRadius: 2,
        }} />
      </View>

      {/* Count */}
      <Text style={{
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
      }}>
        {usage.remaining}/{usage.limit}
      </Text>
    </Pressable>
  );
}
