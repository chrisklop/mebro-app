import { useState, useEffect } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { User, Plus, Shield, Mail, Trophy } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth';
import { colors, spacing, borderRadius } from '../lib/design';
import { ContactModal } from './ContactModal';
import { API_BASE } from '../lib/constants';

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user, usage } = useAuth();
  const isHome = pathname === '/';
  const isLogin = pathname === '/login';
  const isLeaderboard = pathname === '/leaderboard';
  const [showContactModal, setShowContactModal] = useState(false);
  const [tier, setTier] = useState<{ name: string; color: string } | null>(null);
  const [totalViews, setTotalViews] = useState(0);

  // Fetch user's tier
  useEffect(() => {
    const fetchTier = async () => {
      try {
        const res = await fetch(`${API_BASE}/sharers/me`);
        const data = await res.json();
        if (data.success && data.sharer) {
          setTier(data.sharer.tier);
          setTotalViews(data.sharer.totalViews);
        }
      } catch {
        // Silent fail
      }
    };
    fetchTier();
  }, []);

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
        {/* Left side - Logo or Privacy/Contact links on home */}
        {isHome ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
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
            <Pressable
              onPress={() => setShowContactModal(true)}
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
              <Mail color={colors.textMuted} size={12} />
              <Text style={{
                fontSize: 12,
                fontWeight: '500',
                color: colors.textMuted,
              }}>
                Contact
              </Text>
            </Pressable>
          </View>
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
          {/* Leaderboard / Tier Badge */}
          <Pressable
            onPress={() => router.push('/leaderboard')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: borderRadius.md,
              backgroundColor: tier ? tier.color + '20' : 'rgba(245, 158, 11, 0.1)',
            }}
          >
            <Trophy size={16} color={tier?.color || '#f59e0b'} />
            {tier && totalViews > 0 && (
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: tier.color,
              }}>
                {totalViews}
              </Text>
            )}
          </Pressable>

          {/* New Check button (when not on home) */}
          {!isHome && !isLogin && !isLeaderboard && (
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

      {/* Contact Modal */}
      <ContactModal
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </View>
  );
}
