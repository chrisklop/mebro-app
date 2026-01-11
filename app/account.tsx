import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Mail, Crown, Zap, LogOut, ChevronRight, Shield } from 'lucide-react-native';
import { useAuth } from '../lib/auth';
import { getSubscriptionInfo, SubscriptionInfo, getUsageLimits } from '../lib/purchases';
import { Paywall } from '../components/Paywall';
import { colors, spacing, borderRadius, shadows } from '../lib/design';

export default function AccountScreen() {
  const router = useRouter();
  const { user, usage, signOut } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    const info = await getSubscriptionInfo();
    setSubscription(info);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

  const getTierIcon = () => {
    if (subscription?.tier === 'pro') return Crown;
    if (subscription?.tier === 'plus') return Zap;
    return User;
  };

  const getTierName = () => {
    if (subscription?.tier === 'pro') return 'Pro';
    if (subscription?.tier === 'plus') return 'Plus';
    return 'Free';
  };

  const TierIcon = getTierIcon();

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
        }}
      >
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
        <Text style={{
          fontSize: 32,
          fontWeight: '800',
          color: colors.textPrimary,
          marginBottom: spacing.xl,
        }}>
          Account
        </Text>

        {/* Profile Card */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          marginBottom: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.sm,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.lg,
          }}>
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.md,
            }}>
              <User color={colors.textOnDark} size={28} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: spacing.xs,
              }}>
                {user?.email || 'Guest'}
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.backgroundAlt,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: borderRadius.sm,
                alignSelf: 'flex-start',
              }}>
                <TierIcon color={colors.textSecondary} size={14} style={{ marginRight: spacing.xs }} />
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: colors.textSecondary,
                }}>
                  {getTierName()} Plan
                </Text>
              </View>
            </View>
          </View>

          {/* Usage */}
          <View style={{
            backgroundColor: colors.backgroundAlt,
            borderRadius: borderRadius.md,
            padding: spacing.md,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: spacing.sm,
            }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                Daily Usage
              </Text>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.textPrimary,
              }}>
                {usage.remaining}/{usage.limit} remaining
              </Text>
            </View>
            <View style={{
              height: 8,
              backgroundColor: colors.border,
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <View style={{
                width: `${(usage.remaining / usage.limit) * 100}%`,
                height: '100%',
                backgroundColor: usage.remaining > usage.limit * 0.2
                  ? colors.verdictTrue
                  : colors.verdictFalse,
                borderRadius: 4,
              }} />
            </View>
          </View>
        </View>

        {/* Upgrade Card - show if not pro */}
        {subscription?.tier !== 'pro' && (
          <Pressable
            onPress={() => setShowPaywall(true)}
            style={{
              backgroundColor: colors.surfaceDark,
              borderRadius: borderRadius.xl,
              padding: spacing.lg,
              marginBottom: spacing.lg,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: borderRadius.md,
              backgroundColor: 'rgba(255,255,255,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.md,
            }}>
              <Crown color={colors.textOnDark} size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.textOnDark,
                marginBottom: spacing.xs,
              }}>
                Upgrade your plan
              </Text>
              <Text style={{
                fontSize: 13,
                color: colors.textOnDarkMuted,
              }}>
                Get up to 150 fact checks per day
              </Text>
            </View>
            <ChevronRight color={colors.textOnDarkMuted} size={20} />
          </Pressable>
        )}

        {/* Menu Items */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.sm,
        }}>
          <MenuItem
            icon={Shield}
            label="Privacy Policy"
            onPress={() => router.push('/privacy')}
          />

          {user && (
            <MenuItem
              icon={LogOut}
              label="Log Out"
              onPress={handleLogout}
              destructive
              isLast
            />
          )}
        </View>

        {/* Version */}
        <Text style={{
          fontSize: 12,
          color: colors.textMuted,
          textAlign: 'center',
          marginTop: spacing.xl,
        }}>
          Mebro v1.0.0
        </Text>
      </ScrollView>

      {/* Paywall Modal */}
      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <Paywall
          onClose={() => setShowPaywall(false)}
          onPurchaseComplete={() => {
            setShowPaywall(false);
            loadSubscription();
          }}
        />
      </Modal>
    </>
  );
}

interface MenuItemProps {
  icon: typeof User;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  isLast?: boolean;
}

function MenuItem({ icon: Icon, label, onPress, destructive, isLast }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <Icon
        color={destructive ? colors.verdictFalse : colors.textSecondary}
        size={20}
        style={{ marginRight: spacing.md }}
      />
      <Text style={{
        flex: 1,
        fontSize: 16,
        color: destructive ? colors.verdictFalse : colors.textPrimary,
      }}>
        {label}
      </Text>
      <ChevronRight color={colors.textMuted} size={20} />
    </Pressable>
  );
}
