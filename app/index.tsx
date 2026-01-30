import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Search, ArrowRight, Zap, Shield, Share2, Link, CheckCircle, XCircle, AlertTriangle, HelpCircle } from 'lucide-react-native';
import { createClaim } from '../lib/api';
import { API_BASE } from '../lib/constants';
import { useAuth } from '../lib/auth';
import { colors, spacing, shadows, borderRadius, getWaitingMessage, getRandomProgressQuote } from '../lib/design';
import type { Tone } from '../lib/types';

interface RecentClaim {
  slug: string;
  query: string;
  verdict: string;
  checked_at: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { updateUsage } = useAuth();
  const [query, setQuery] = useState('');
  const [tone, setTone] = useState<Tone>('cordial');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [currentQuote, setCurrentQuote] = useState('');
  const [recentClaims, setRecentClaims] = useState<RecentClaim[]>([]);
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  // Rotate through waiting messages every 6 seconds, alternating with wisdom quotes
  useEffect(() => {
    if (!isLoading) {
      setMessageIndex(0);
      return;
    }
    // Set initial quote
    setCurrentQuote(getRandomProgressQuote());

    const interval = setInterval(() => {
      setMessageIndex(prev => prev + 1);
      // Update wisdom quote every cycle
      setCurrentQuote(getRandomProgressQuote());
    }, 6000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Fetch recent claims on mount
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch(`${API_BASE}/claims?limit=3`);
        const data = await res.json();
        if (data.success && data.claims) {
          setRecentClaims(data.claims);
        }
      } catch {
        // Silent fail - don't block UX
      }
    };
    fetchRecent();
  }, []);

  // Pulsing animation for the loading indicator
  useEffect(() => {
    if (!isLoading) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isLoading, pulseAnim]);

  const handleSubmit = async () => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await createClaim(query.trim(), tone, updateUsage);
      if (response.success && response.claim) {
        router.push(`/r/${response.claim.slug}`);
      } else {
        setError(response.error || 'Something went wrong');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const tones: { key: Tone; label: string }[] = [
    { key: 'cordial', label: 'Cordial' },
    { key: 'academic', label: 'Academic' },
    { key: 'brutal', label: 'Brutal' },
  ];

  const features = [
    { icon: Zap, label: 'Instant' },
    { icon: Shield, label: 'Sourced' },
    { icon: Share2, label: 'Shareable' },
  ];

  const getVerdictIcon = (verdict: string) => {
    switch (verdict?.toUpperCase()) {
      case 'TRUE': return CheckCircle;
      case 'FALSE': return XCircle;
      case 'MISLEADING': return AlertTriangle;
      default: return HelpCircle;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict?.toUpperCase()) {
      case 'TRUE': return colors.verdictTrue;
      case 'FALSE': return colors.verdictFalse;
      case 'MISLEADING': return colors.verdictNuanced;
      default: return colors.textMuted;
    }
  };

  const content = (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, paddingHorizontal: spacing.md, justifyContent: 'center' }}>
        <View style={{ maxWidth: 500, alignSelf: 'center', width: '100%' }}>
          {/* Hero - compact */}
          <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
            <View style={{ position: 'relative', marginBottom: -4 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.textPrimary,
                textAlign: 'center',
              }}>
                Trust me, Bro
              </Text>
              <View style={{
                position: 'absolute',
                top: '50%',
                left: -6,
                right: -6,
                height: 2,
                backgroundColor: colors.textPrimary,
              }} />
            </View>

            <Text style={{
              fontSize: 20,
              fontWeight: '800',
              letterSpacing: 4,
              color: colors.textPrimary,
              marginBottom: -12,
            }}>
              TRUST
            </Text>
            <Text style={{
              fontSize: 64,
              fontWeight: '900',
              letterSpacing: 2,
              color: colors.textPrimary,
              textShadowColor: '#d4a547',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 15,
            }}>
              MEBRO
            </Text>
            <Text style={{
              fontSize: 13,
              color: colors.textSecondary,
              textAlign: 'center',
              marginTop: -4,
            }}>
              Paste a claim. Get the facts. Share the truth.
            </Text>
          </View>

          {/* Input Card */}
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
            ...shadows.md,
          }}>
            {/* Tone Selector */}
            <View style={{
              flexDirection: 'row',
              backgroundColor: colors.backgroundAlt,
              borderRadius: borderRadius.md,
              padding: 3,
              marginBottom: spacing.sm,
            }}>
              {tones.map((t) => (
                <Pressable
                  key={t.key}
                  onPress={() => setTone(t.key)}
                  style={{
                    flex: 1,
                    paddingVertical: spacing.sm,
                    borderRadius: borderRadius.sm,
                    backgroundColor: tone === t.key ? colors.surface : 'transparent',
                    ...(tone === t.key ? shadows.sm : {}),
                  }}
                >
                  <Text style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: tone === t.key ? colors.textPrimary : colors.textMuted,
                    textAlign: 'center',
                  }}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Text Input */}
            <View style={{
              backgroundColor: colors.backgroundAlt,
              borderRadius: borderRadius.md,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.sm,
              marginBottom: spacing.sm,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Search color={colors.textMuted} size={18} style={{ marginRight: 10, marginTop: 2 }} />
                <TextInput
                  multiline
                  placeholder="Paste a claim, quote, or something you saw online..."
                  placeholderTextColor={colors.textMuted}
                  value={query}
                  onChangeText={(text) => setQuery(text.slice(0, 2000))}
                  editable={!isLoading}
                  style={{
                    flex: 1,
                    color: colors.textPrimary,
                    fontSize: 15,
                    minHeight: 40,
                    maxHeight: 100,
                    lineHeight: 22,
                    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
                  }}
                />
              </View>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: spacing.xs,
                paddingTop: spacing.xs,
                borderTopWidth: 1,
                borderTopColor: colors.borderLight,
              }}>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                  {query.length}/2000
                </Text>
                {error && (
                  <Text style={{ fontSize: 11, color: colors.verdictFalse }}>
                    {error}
                  </Text>
                )}
              </View>
            </View>

            {/* Waiting Messages */}
            {isLoading && (
              <View style={{ marginBottom: spacing.sm }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.xs,
                }}>
                  <Animated.View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.textPrimary,
                    marginRight: spacing.xs,
                    opacity: pulseAnim,
                  }} />
                  <Animated.View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.textPrimary,
                    marginRight: spacing.xs,
                    opacity: pulseAnim,
                  }} />
                  <Animated.View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.textPrimary,
                    opacity: pulseAnim,
                  }} />
                </View>
                <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center', lineHeight: 18, paddingHorizontal: spacing.sm, marginBottom: spacing.sm }}>
                  {getWaitingMessage(tone, messageIndex)}
                </Text>
                {currentQuote && (
                  <View style={{ borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.sm }}>
                    <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', fontStyle: 'italic', lineHeight: 16, paddingHorizontal: spacing.md }}>
                      "{currentQuote}"
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={!query.trim() || isLoading}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: !query.trim() || isLoading ? colors.border : colors.primary,
                paddingVertical: spacing.sm + 2,
                borderRadius: borderRadius.md,
              }}
            >
              {isLoading ? (
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textOnDark }}>
                  Checking...
                </Text>
              ) : (
                <>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textOnDark, marginRight: spacing.sm }}>
                    Fact Check This
                  </Text>
                  <ArrowRight color={colors.textOnDark} size={18} />
                </>
              )}
            </Pressable>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: spacing.xs,
            }}>
              <Link color={colors.textMuted} size={12} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: colors.textMuted }}>
                Get a shareable link
              </Text>
            </View>
          </View>

          {/* Features - horizontal row */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: spacing.lg,
            gap: spacing.lg,
          }}>
            {features.map((feature, i) => (
              <View key={i} style={{ alignItems: 'center' }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: spacing.xs,
                }}>
                  <feature.icon color={colors.textPrimary} size={20} />
                </View>
                <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '500' }}>
                  {feature.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Recent Fact Checks */}
          {recentClaims.length > 0 && (
            <View style={{ marginTop: spacing.xl }}>
              <Text style={{
                fontSize: 11,
                fontWeight: '600',
                color: colors.textMuted,
                textAlign: 'center',
                letterSpacing: 1,
                marginBottom: spacing.sm,
              }}>
                RECENT FACT CHECKS
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.sm }}>
                {recentClaims.map((claim) => {
                  const VerdictIcon = getVerdictIcon(claim.verdict);
                  const verdictColor = getVerdictColor(claim.verdict);
                  return (
                    <Pressable
                      key={claim.slug}
                      onPress={() => router.push(`/r/${claim.slug}`)}
                      style={{
                        width: 100,
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.md,
                        padding: spacing.sm,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: 'center',
                      }}
                    >
                      <VerdictIcon color={verdictColor} size={16} />
                      <Text
                        style={{
                          fontSize: 10,
                          color: colors.textPrimary,
                          textAlign: 'center',
                          marginTop: spacing.xs,
                          lineHeight: 14,
                        }}
                        numberOfLines={2}
                      >
                        {claim.query.length > 30 ? claim.query.slice(0, 30) + '...' : claim.query}
                      </Text>
                      <Text style={{
                        fontSize: 9,
                        fontWeight: '600',
                        color: verdictColor,
                        marginTop: spacing.xs,
                      }}>
                        {claim.verdict?.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Tagline */}
          <Text style={{
            fontSize: 12,
            color: colors.textMuted,
            fontStyle: 'italic',
            textAlign: 'center',
            marginTop: spacing.lg,
          }}>
            Because "trust me bro" isn't a source.
          </Text>
        </View>
        </View>
      </KeyboardAvoidingView>
  );

  // On web, don't wrap with TouchableWithoutFeedback (interferes with input focus)
  if (Platform.OS === 'web') {
    return content;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {content}
    </TouchableWithoutFeedback>
  );
}
