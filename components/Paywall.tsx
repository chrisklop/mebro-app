import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { X, Check, Zap, Crown, Sparkles, Bell } from 'lucide-react-native';
// RevenueCat imports - uncomment when ready to enable payments
// import { PurchasesPackage } from 'react-native-purchases';
// import { getOfferings, purchasePackage, restorePurchases, getPriceString } from '../lib/purchases';
import { colors, spacing, borderRadius, shadows } from '../lib/design';

// Set to true when RevenueCat is configured
const PAYMENTS_ENABLED = false;

interface PaywallProps {
  onClose: () => void;
  onPurchaseComplete: () => void;
}

interface PlanOption {
  id: string;
  name: string;
  price: string;
  checksPerDay: number;
  features: string[];
  icon: typeof Zap;
  popular?: boolean;
  pkg?: any; // PurchasesPackage when RevenueCat is enabled
}

export function Paywall({ onClose, onPurchaseComplete }: PaywallProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('plus');
  const plans: PlanOption[] = [
    {
      id: 'plus',
      name: 'Plus',
      price: '$5/mo',
      checksPerDay: 50,
      features: ['50 fact checks per day', 'Priority processing', 'History saved 30 days'],
      icon: Zap,
      popular: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$12/mo',
      checksPerDay: 150,
      features: ['150 fact checks per day', 'Priority processing', 'Unlimited history', 'API access'],
      icon: Crown,
    },
  ];

  // Coming Soon UI when payments not enabled
  if (!PAYMENTS_ENABLED) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <Pressable onPress={onClose}>
            <X color={colors.textPrimary} size={24} />
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
            Upgrade
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing.xl,
        }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.surfaceDark,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.lg,
          }}>
            <Bell color={colors.textOnDark} size={36} />
          </View>

          <Text style={{
            fontSize: 28,
            fontWeight: '800',
            color: colors.textPrimary,
            textAlign: 'center',
            marginBottom: spacing.sm,
          }}>
            Coming Soon
          </Text>

          <Text style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: spacing.xl,
            lineHeight: 24,
          }}>
            Premium plans with up to 150 fact checks per day are on the way!
          </Text>

          {/* Preview of plans */}
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            width: '100%',
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.textMuted,
              marginBottom: spacing.md,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              Planned Tiers
            </Text>

            {plans.map((plan, index) => (
              <View
                key={plan.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.sm,
                  borderTopWidth: index > 0 ? 1 : 0,
                  borderTopColor: colors.border,
                }}
              >
                <plan.icon color={colors.textSecondary} size={20} style={{ marginRight: spacing.md }} />
                <Text style={{ flex: 1, fontSize: 16, color: colors.textPrimary, fontWeight: '500' }}>
                  {plan.name}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  {plan.checksPerDay}/day
                </Text>
                <Text style={{ fontSize: 14, color: colors.textMuted, marginLeft: spacing.sm }}>
                  {plan.price}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={onClose}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.xxl,
              borderRadius: borderRadius.full,
              marginTop: spacing.xl,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textOnDark }}>
              Got it
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Full paywall UI (when payments enabled) - keeping for future
  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.background,
    }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <Pressable onPress={onClose}>
          <X color={colors.textPrimary} size={24} />
        </Pressable>
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.textPrimary,
        }}>
          Upgrade
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
        }}
      >
        {/* Hero */}
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <Sparkles color={colors.textPrimary} size={48} style={{ marginBottom: spacing.md }} />
          <Text style={{
            fontSize: 28,
            fontWeight: '800',
            color: colors.textPrimary,
            textAlign: 'center',
            marginBottom: spacing.sm,
          }}>
            Unlock More Facts
          </Text>
          <Text style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            maxWidth: 300,
          }}>
            Get more daily fact checks and premium features
          </Text>
        </View>

        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
            <ActivityIndicator size="large" color={colors.textPrimary} />
          </View>
        ) : (
          <>
            {/* Plan Cards */}
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const Icon = plan.icon;

              return (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan.id)}
                  style={{
                    backgroundColor: isSelected ? colors.surface : colors.backgroundAlt,
                    borderRadius: borderRadius.xl,
                    padding: spacing.lg,
                    marginBottom: spacing.md,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                    ...(isSelected ? shadows.md : {}),
                  }}
                >
                  {plan.popular && (
                    <View style={{
                      position: 'absolute',
                      top: -10,
                      right: spacing.lg,
                      backgroundColor: colors.verdictTrue,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                      borderRadius: borderRadius.sm,
                    }}>
                      <Text style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: colors.textOnDark,
                        textTransform: 'uppercase',
                      }}>
                        Popular
                      </Text>
                    </View>
                  )}

                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: spacing.md,
                  }}>
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: borderRadius.md,
                      backgroundColor: isSelected ? colors.primary : colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: spacing.md,
                    }}>
                      <Icon color={isSelected ? colors.textOnDark : colors.textMuted} size={22} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 20,
                        fontWeight: '700',
                        color: colors.textPrimary,
                      }}>
                        {plan.name}
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: colors.textSecondary,
                      }}>
                        {plan.checksPerDay} checks/day
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: 22,
                      fontWeight: '800',
                      color: colors.textPrimary,
                    }}>
                      {plan.price}
                    </Text>
                  </View>

                  <View style={{
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingTop: spacing.md,
                  }}>
                    {plan.features.map((feature, i) => (
                      <View
                        key={i}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: i < plan.features.length - 1 ? spacing.xs : 0,
                        }}
                      >
                        <Check color={colors.verdictTrue} size={16} style={{ marginRight: spacing.sm }} />
                        <Text style={{
                          fontSize: 14,
                          color: colors.textSecondary,
                        }}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Pressable>
              );
            })}

            {/* Error */}
            {error && (
              <View style={{
                backgroundColor: colors.verdictFalse + '20',
                padding: spacing.md,
                borderRadius: borderRadius.md,
                marginBottom: spacing.md,
              }}>
                <Text style={{ color: colors.verdictFalse, textAlign: 'center' }}>
                  {error}
                </Text>
              </View>
            )}

            {/* Purchase Button */}
            <Pressable
              onPress={handlePurchase}
              disabled={purchasing}
              style={{
                backgroundColor: purchasing ? colors.border : colors.primary,
                paddingVertical: spacing.md + 4,
                borderRadius: borderRadius.md,
                alignItems: 'center',
                marginTop: spacing.md,
              }}
            >
              {purchasing ? (
                <ActivityIndicator color={colors.textOnDark} />
              ) : (
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textOnDark,
                }}>
                  Subscribe to {plans.find(p => p.id === selectedPlan)?.name}
                </Text>
              )}
            </Pressable>

            {/* Restore */}
            <Pressable
              onPress={handleRestore}
              disabled={purchasing}
              style={{
                paddingVertical: spacing.md,
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontSize: 14,
                color: colors.textMuted,
                textDecorationLine: 'underline',
              }}>
                Restore Purchases
              </Text>
            </Pressable>

            {/* Terms */}
            <Text style={{
              fontSize: 11,
              color: colors.textMuted,
              textAlign: 'center',
              marginTop: spacing.md,
              lineHeight: 16,
            }}>
              Payment will be charged to your App Store account. Subscription automatically
              renews unless cancelled at least 24 hours before the end of the current period.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}
