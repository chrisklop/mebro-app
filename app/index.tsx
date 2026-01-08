import { ScrollView, View, Text, TextInput, Pressable, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Search, ArrowRight, Zap, Shield, Share2, CheckCircle, Link } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { createClaim } from '../lib/api';
import { colors, spacing, shadows, borderRadius } from '../lib/design';
import type { Tone } from '../lib/types';

// Progress stages for the loading state
const PROGRESS_STAGES = [
  { progress: 0.1, message: 'Analyzing claim...' },
  { progress: 0.25, message: 'Searching sources...' },
  { progress: 0.5, message: 'Verifying facts...' },
  { progress: 0.75, message: 'Cross-referencing...' },
  { progress: 0.9, message: 'Generating verdict...' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [tone, setTone] = useState<Tone>('snarky');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressStage, setProgressStage] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // Animated glow for shield
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  // Progress simulation during loading
  useEffect(() => {
    if (!isLoading) {
      setProgressStage(0);
      return;
    }

    const intervals = [800, 1500, 2000, 2500, 3000];
    let currentStage = 0;

    const advanceStage = () => {
      if (currentStage < PROGRESS_STAGES.length - 1) {
        currentStage++;
        setProgressStage(currentStage);
      }
    };

    const timers = intervals.map((delay, i) =>
      setTimeout(advanceStage, intervals.slice(0, i + 1).reduce((a, b) => a + b, 0))
    );

    return () => timers.forEach(clearTimeout);
  }, [isLoading]);

  const handleSubmit = async () => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await createClaim(query.trim(), tone);

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
    { key: 'academic', label: 'Academic' },
    { key: 'snarky', label: 'Snarky' },
    { key: 'brutal', label: 'Brutal' },
  ];

  const features = [
    { icon: Zap, title: 'Instant Analysis', desc: 'Research in seconds' },
    { icon: Shield, title: 'Primary Sources', desc: 'Credible citations' },
    { icon: Share2, title: 'Shareable Links', desc: 'Send the truth' },
  ];

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 0 }}
    >
      {/* Hero Section */}
      <View style={{
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xxl,
        alignItems: 'center',
      }}>
        {/* Strikethrough "Trust me, Bro" */}
        <View style={{ position: 'relative', marginBottom: spacing.lg }}>
          <Text style={{
            fontSize: 28,
            fontWeight: '700',
            color: colors.textPrimary,
            textAlign: 'center',
          }}>
            Trust me, Bro
          </Text>
          <View style={{
            position: 'absolute',
            top: '50%',
            left: -8,
            right: -8,
            height: 3,
            backgroundColor: colors.textPrimary,
            transform: [{ translateY: -1.5 }],
          }} />
        </View>

        {/* Shield Logo with TRUST/MEBRO */}
        <Animated.View style={{
          alignItems: 'center',
          marginBottom: spacing.xl,
          transform: [{ scale: glowScale }],
        }}>
          {/* Glow effect */}
          <Animated.View style={{
            position: 'absolute',
            width: 180,
            height: 200,
            backgroundColor: colors.textPrimary,
            borderRadius: 100,
            opacity: glowOpacity,
            top: -10,
            filter: 'blur(30px)',
          }} />

          {/* Shield container */}
          <View style={{ position: 'relative', width: 160, height: 180, alignItems: 'center', justifyContent: 'center' }}>
            {/* Shield SVG */}
            <Svg
              width={160}
              height={180}
              viewBox="0 0 100 120"
              style={{ position: 'absolute' }}
            >
              <Path
                d="M50 5 L95 25 L95 65 C95 85 75 105 50 115 C25 105 5 85 5 65 L5 25 Z"
                stroke={colors.textPrimary}
                strokeWidth={2.5}
                fill="none"
              />
              <Path
                d="M50 12 L88 29 L88 63 C88 80 70 98 50 107 C30 98 12 80 12 63 L12 29 Z"
                stroke={colors.textPrimary}
                strokeWidth={1}
                fill="none"
                opacity={0.4}
              />
            </Svg>

            {/* TRUST text */}
            <Text style={{
              position: 'absolute',
              top: 45,
              fontSize: 14,
              fontWeight: '800',
              letterSpacing: 4,
              color: colors.textPrimary,
            }}>
              TRUST
            </Text>

            {/* MEBRO text */}
            <Text style={{
              position: 'absolute',
              bottom: 35,
              fontSize: 28,
              fontWeight: '900',
              letterSpacing: 1,
              color: colors.textPrimary,
            }}>
              MEBRO
            </Text>
          </View>
        </Animated.View>

        {/* Main Input Card */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          width: '100%',
          maxWidth: 600,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.lg,
        }}>
          {/* Tone Selector */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: colors.backgroundAlt,
            borderRadius: borderRadius.md,
            padding: 4,
            marginBottom: spacing.md,
          }}>
            {tones.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => setTone(t.key)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm + 2,
                  paddingHorizontal: spacing.md,
                  borderRadius: borderRadius.sm,
                  backgroundColor: tone === t.key ? colors.surface : 'transparent',
                  ...(tone === t.key ? shadows.sm : {}),
                }}
              >
                <Text style={{
                  fontSize: 14,
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
            borderColor: isFocused ? colors.border : colors.border,
            padding: spacing.md,
            marginBottom: spacing.md,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Search color={colors.textMuted} size={20} style={{ marginRight: 12, marginTop: 2 }} />
              <TextInput
                multiline
                placeholder="Paste a claim, quote, or something you saw online..."
                placeholderTextColor={colors.textMuted}
                value={query}
                onChangeText={(text) => setQuery(text.slice(0, 2000))}
                editable={!isLoading}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                  flex: 1,
                  color: colors.textPrimary,
                  fontSize: 16,
                  minHeight: 80,
                  lineHeight: 24,
                  outlineStyle: 'none',
                }}
              />
            </View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: spacing.sm,
              paddingTop: spacing.sm,
              borderTopWidth: 1,
              borderTopColor: colors.borderLight,
            }}>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>
                {query.length}/2000
              </Text>
              {error && (
                <Text style={{ fontSize: 12, color: colors.verdictFalse }}>
                  {error}
                </Text>
              )}
            </View>
          </View>

          {/* Progress Bar (shown when loading) */}
          {isLoading && (
            <View style={{ marginBottom: spacing.md }}>
              <View style={{
                height: 4,
                backgroundColor: colors.backgroundAlt,
                borderRadius: 2,
                overflow: 'hidden',
                marginBottom: spacing.xs,
              }}>
                <View style={{
                  height: '100%',
                  width: `${PROGRESS_STAGES[progressStage].progress * 100}%`,
                  backgroundColor: colors.textPrimary,
                  borderRadius: 2,
                  transition: 'width 0.3s ease',
                }} />
              </View>
              <Text style={{
                fontSize: 12,
                color: colors.textMuted,
                textAlign: 'center',
              }}>
                {PROGRESS_STAGES[progressStage].message}
              </Text>
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
              gap: spacing.sm,
              backgroundColor: !query.trim() || isLoading ? colors.border : colors.primary,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.md,
            }}
          >
            {isLoading ? (
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textOnDark }}>
                Checking...
              </Text>
            ) : (
              <>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textOnDark }}>
                  Fact Check This
                </Text>
                <ArrowRight color={colors.textOnDark} size={20} />
              </>
            )}
          </Pressable>

          {/* Get a shareable link text */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.xs,
            marginTop: spacing.sm,
          }}>
            <Link color={colors.textMuted} size={14} />
            <Text style={{ fontSize: 13, color: colors.textMuted }}>
              Get a shareable link
            </Text>
          </View>
        </View>
      </View>

      {/* Features Section */}
      <View style={{
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xxl,
      }}>
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.md,
          justifyContent: 'center',
          maxWidth: 900,
          alignSelf: 'center',
        }}>
          {features.map((feature, i) => (
            <View
              key={i}
              style={{
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                width: 260,
                borderWidth: 1,
                borderColor: colors.border,
                ...shadows.sm,
              }}
            >
              <View style={{
                width: 44,
                height: 44,
                borderRadius: borderRadius.md,
                backgroundColor: colors.backgroundAlt,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.md,
              }}>
                <feature.icon color={colors.textPrimary} size={22} />
              </View>
              <Text style={{
                fontSize: 17,
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: spacing.xs,
              }}>
                {feature.title}
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                lineHeight: 20,
              }}>
                {feature.desc}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Dark Panel Section */}
      <View style={{
        backgroundColor: colors.surfaceDark,
        paddingVertical: spacing.xxxl,
        paddingHorizontal: spacing.lg,
      }}>
        <View style={{
          maxWidth: 800,
          alignSelf: 'center',
          width: '100%',
        }}>
          <View style={{ alignItems: 'center', marginBottom: spacing.xxl }}>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.textOnDarkMuted,
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: spacing.sm,
            }}>
              How It Works
            </Text>
            <Text style={{
              fontSize: 32,
              fontWeight: '700',
              color: colors.textOnDark,
              textAlign: 'center',
              letterSpacing: -1,
            }}>
              Get verdicts with receipts
            </Text>
          </View>

          <View style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: borderRadius.xl,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}>
            <View style={{
              padding: spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.1)',
            }}>
              <Text style={{
                fontSize: 11,
                fontWeight: '600',
                color: colors.textOnDarkMuted,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: spacing.xs,
              }}>
                Sample Claim
              </Text>
              <Text style={{
                fontSize: 18,
                color: colors.textOnDark,
                fontStyle: 'italic',
                lineHeight: 26,
              }}>
                "The Great Wall of China is visible from space"
              </Text>
            </View>

            <View style={{
              padding: spacing.lg,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
            }}>
              <View style={{
                backgroundColor: colors.verdictFalse,
                width: 8,
                height: 8,
                borderRadius: 4,
              }} />
              <Text style={{
                fontSize: 24,
                fontWeight: '800',
                color: colors.verdictFalse,
              }}>
                False
              </Text>
            </View>

            <View style={{ padding: spacing.lg, paddingTop: 0 }}>
              <Text style={{ fontSize: 12, color: colors.textOnDarkMuted, marginBottom: spacing.sm }}>
                3 sources cited
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {['NASA', 'Snopes', 'Scientific American'].map((source, i) => (
                  <View key={i} style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: borderRadius.sm,
                  }}>
                    <Text style={{ fontSize: 12, color: colors.textOnDark, fontWeight: '500' }}>
                      {source}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={{ alignItems: 'center', marginTop: spacing.xxl }}>
            <Pressable style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: colors.surface,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.xl,
              borderRadius: borderRadius.full,
            }}>
              <CheckCircle color={colors.textPrimary} size={18} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                Try it yourself
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Bottom tagline */}
      <View style={{
        alignItems: 'center',
        paddingVertical: spacing.xxl,
        backgroundColor: colors.background,
      }}>
        <Text style={{ fontSize: 14, color: colors.textMuted, fontStyle: 'italic' }}>
          Because "trust me bro" isn't a source.
        </Text>
      </View>
    </ScrollView>
  );
}
