import { View, Text, TextInput, Pressable, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Search, ArrowRight } from 'lucide-react-native';
import { analyzeClaim } from '../../lib/cogdiss-api';
import { colors, spacing, borderRadius, shadows, getWaitingMessage, getRandomProgressQuote } from '../../lib/design';
import type { Tone } from '../../lib/types';

export default function CogEntryScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [tone, setTone] = useState<Tone>('cordial');
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
      const response = await analyzeClaim(query.trim(), tone);
      if (response.success && response.slug) {
        router.push(`/cog/${response.slug}`);
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceDark, justifyContent: 'center', paddingHorizontal: spacing.lg }}>
      <View style={{ maxWidth: 560, alignSelf: 'center', width: '100%' }}>
        {/* Header */}
        <View style={{ marginBottom: spacing.xl }}>
          <Text style={{
            fontSize: 11,
            fontWeight: '600',
            color: colors.verdictUnverified,
            letterSpacing: 2,
            marginBottom: spacing.xs,
          }}>
            EXPERIMENTAL
          </Text>
          <Text style={{
            fontSize: 28,
            fontWeight: '800',
            color: colors.textOnDark,
            marginBottom: spacing.xs,
          }}>
            Cognitive Dissonance Lab
          </Text>
          <Text style={{ fontSize: 14, color: colors.textOnDarkMuted, lineHeight: 20 }}>
            Dual-mode analysis: fact check + disinformation source breakdown side by side.
          </Text>
        </View>

        {/* Input Card */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          ...shadows.lg,
        }}>
          {/* Tone Selector */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: 'rgba(0,0,0,0.3)',
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
                  backgroundColor: tone === t.key ? 'rgba(255,255,255,0.12)' : 'transparent',
                }}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: tone === t.key ? colors.textOnDark : colors.textOnDarkMuted,
                  textAlign: 'center',
                }}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Text Input */}
          <View style={{
            backgroundColor: 'rgba(0,0,0,0.25)',
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            padding: spacing.sm,
            marginBottom: spacing.sm,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Search color={colors.textOnDarkMuted} size={18} style={{ marginRight: 10, marginTop: 2 }} />
              <TextInput
                multiline
                placeholder="Paste a claim to analyze..."
                placeholderTextColor={colors.textOnDarkMuted}
                value={query}
                onChangeText={(text) => setQuery(text.slice(0, 2000))}
                editable={!isLoading}
                style={{
                  flex: 1,
                  color: colors.textOnDark,
                  fontSize: 15,
                  minHeight: 60,
                  maxHeight: 120,
                  lineHeight: 22,
                }}
              />
            </View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: spacing.xs,
              paddingTop: spacing.xs,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.06)',
            }}>
              <Text style={{ fontSize: 11, color: colors.textOnDarkMuted }}>
                {query.length}/2000
              </Text>
              {error && (
                <Text style={{ fontSize: 11, color: colors.verdictFalse }}>{error}</Text>
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
                {[0, 1, 2].map(i => (
                  <Animated.View key={i} style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.verdictUnverified,
                    marginHorizontal: 3,
                    opacity: pulseAnim,
                  }} />
                ))}
              </View>
              <Text style={{
                fontSize: 12,
                color: colors.textOnDarkMuted,
                textAlign: 'center',
                lineHeight: 18,
                paddingHorizontal: spacing.sm,
                marginBottom: spacing.sm,
              }}>
                {getWaitingMessage(tone, messageIndex)}
              </Text>
              {currentQuote && (
                <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: spacing.sm }}>
                  <Text style={{
                    fontSize: 11,
                    color: colors.textOnDarkMuted,
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
              backgroundColor: !query.trim() || isLoading
                ? 'rgba(124,58,237,0.3)'
                : colors.verdictUnverified,
              paddingVertical: spacing.sm + 2,
              borderRadius: borderRadius.md,
              gap: spacing.sm,
            }}
          >
            {isLoading ? (
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textOnDark }}>
                Analyzing...
              </Text>
            ) : (
              <>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textOnDark }}>
                  Run Dual Analysis
                </Text>
                <ArrowRight color={colors.textOnDark} size={18} />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
