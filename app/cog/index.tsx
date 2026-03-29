import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Keyboard, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Search, ArrowRight } from 'lucide-react-native';
import { createClaim } from '../../lib/api';
import { startCogDissAnalysis } from '../../lib/cogdiss-api';
import { useAuth } from '../../lib/auth';
import { colors, spacing, shadows, borderRadius, getWaitingMessage, getRandomProgressQuote } from '../../lib/design';
import type { Tone } from '../../lib/types';

export default function CogEntryScreen() {
  const router = useRouter();
  const { updateUsage } = useAuth();
  const [query, setQuery] = useState('');
  const tone: Tone = 'academic';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [currentQuote, setCurrentQuote] = useState('');
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!isLoading) {
      setMessageIndex(0);
      return;
    }
    setCurrentQuote(getRandomProgressQuote());
    const interval = setInterval(() => {
      setMessageIndex(prev => prev + 1);
      setCurrentQuote(getRandomProgressQuote());
    }, 6000);
    return () => clearInterval(interval);
  }, [isLoading]);

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
      // Step 1: Create claim via mebro.app (authenticated)
      const claimResponse = await createClaim(query.trim(), tone, updateUsage);
      if (!claimResponse.success || !claimResponse.claim) {
        setError(claimResponse.error || 'Failed to create claim');
        return;
      }
      const slug = claimResponse.claim.slug;

      // Step 2: Kick off cog-diss analysis with the slug
      const cogResponse = await startCogDissAnalysis(slug, query.trim(), tone);
      if (!cogResponse.success) {
        setError(cogResponse.error || 'Failed to start analysis');
        return;
      }

      router.push(`/cog/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const dismissKeyboard = () => {
    if (Platform.OS !== 'web') Keyboard.dismiss();
  };

  return (
    <Pressable onPress={dismissKeyboard} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, paddingHorizontal: spacing.md, justifyContent: 'center' }}>
          <View style={{ maxWidth: 500, alignSelf: 'center', width: '100%' }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
              <View style={{
                backgroundColor: colors.verdictUnverified,
                paddingVertical: 3,
                paddingHorizontal: spacing.sm,
                borderRadius: borderRadius.full,
                marginBottom: spacing.sm,
              }}>
                <Text style={{
                  fontSize: 10,
                  fontWeight: '700',
                  color: colors.textOnDark,
                  letterSpacing: 1.5,
                }}>
                  EXPERIMENTAL
                </Text>
              </View>
              <Text style={{
                fontSize: 28,
                fontWeight: '800',
                color: colors.textPrimary,
                marginBottom: spacing.xs,
              }}>
                Cognitive Dissonance
              </Text>
              <Text style={{
                fontSize: 13,
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 18,
              }}>
                Dual-mode analysis: fact check + disinformation source breakdown side by side.
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
                    placeholder="Paste a claim to analyze..."
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

              {/* Loading state */}
              {isLoading && (
                <View style={{ marginBottom: spacing.sm }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.xs,
                  }}>
                    <Animated.View style={{
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: colors.textPrimary, marginRight: spacing.xs, opacity: pulseAnim,
                    }} />
                    <Animated.View style={{
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: colors.textPrimary, marginRight: spacing.xs, opacity: pulseAnim,
                    }} />
                    <Animated.View style={{
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: colors.textPrimary, opacity: pulseAnim,
                    }} />
                  </View>
                  <Text style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    textAlign: 'center',
                    lineHeight: 18,
                    paddingHorizontal: spacing.sm,
                    marginBottom: spacing.sm,
                  }}>
                    {getWaitingMessage(tone, messageIndex)}
                  </Text>
                  {currentQuote && (
                    <View style={{ borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.sm }}>
                      <Text style={{
                        fontSize: 11,
                        color: colors.textMuted,
                        textAlign: 'center',
                        fontStyle: 'italic',
                        lineHeight: 16,
                        paddingHorizontal: spacing.md,
                      }}>
                        "{currentQuote}"
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Submit */}
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
                    Analyzing...
                  </Text>
                ) : (
                  <>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textOnDark, marginRight: spacing.sm }}>
                      Run Dual Analysis
                    </Text>
                    <ArrowRight color={colors.textOnDark} size={18} />
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Pressable>
  );
}
