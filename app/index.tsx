import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Search, ArrowRight, Zap, Shield, Share2, Link } from 'lucide-react-native';
import { createClaim } from '../lib/api';
import { useAuth } from '../lib/auth';
import { colors, spacing, shadows, borderRadius } from '../lib/design';
import type { Tone } from '../lib/types';

const PROGRESS_STAGES = [
  { progress: 0.1, message: 'Analyzing claim...' },
  { progress: 0.25, message: 'Searching sources...' },
  { progress: 0.5, message: 'Verifying facts...' },
  { progress: 0.75, message: 'Cross-referencing...' },
  { progress: 0.9, message: 'Generating verdict...' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { updateUsage } = useAuth();
  const [query, setQuery] = useState('');
  const [tone, setTone] = useState<Tone>('snarky');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressStage, setProgressStage] = useState(0);

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
    { key: 'academic', label: 'Academic' },
    { key: 'snarky', label: 'Snarky' },
    { key: 'brutal', label: 'Brutal' },
  ];

  const features = [
    { icon: Zap, label: 'Instant' },
    { icon: Shield, label: 'Sourced' },
    { icon: Share2, label: 'Shareable' },
  ];

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                    minHeight: 60,
                    maxHeight: 100,
                    lineHeight: 22,
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

            {/* Progress Bar */}
            {isLoading && (
              <View style={{ marginBottom: spacing.sm }}>
                <View style={{
                  height: 3,
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
                  }} />
                </View>
                <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
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
    </TouchableWithoutFeedback>
  );
}
