import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Keyboard, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { ArrowRight, Youtube } from 'lucide-react-native';
import { startYouTubeAnalysis } from '../../lib/youtube-api';
import { colors, spacing, shadows, borderRadius } from '../../lib/design';

const YT_URL_RE = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)\S+/i;

export default function YouTubeEntryScreen() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

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

  const isValidUrl = YT_URL_RE.test(url.trim());

  const handleSubmit = async () => {
    if (!isValidUrl || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await startYouTubeAnalysis(url.trim());
      if (!res.success || !res.slug) {
        setError(res.error || 'Failed to start analysis');
        return;
      }
      router.push(`/yt/${res.slug}`);
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
            {/* Mode Toggle */}
            <View style={{
              flexDirection: 'row',
              backgroundColor: colors.backgroundAlt,
              borderRadius: borderRadius.md,
              padding: 3,
              marginBottom: spacing.sm,
            }}>
              <Pressable
                onPress={() => router.push('/')}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  borderRadius: borderRadius.sm,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textMuted }}>
                  Text Claim
                </Text>
              </Pressable>
              <View style={{
                flex: 1,
                flexDirection: 'row',
                paddingVertical: spacing.sm,
                borderRadius: borderRadius.sm,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.xs,
                ...shadows.sm,
              }}>
                <Youtube color={colors.textPrimary} size={14} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>
                  YouTube
                </Text>
              </View>
            </View>

            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
              <View style={{
                backgroundColor: colors.verdictFalse,
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
                  FACT CHECKER
                </Text>
              </View>
              <Text style={{
                fontSize: 28,
                fontWeight: '800',
                color: colors.textPrimary,
                marginBottom: spacing.xs,
              }}>
                YouTube Analysis
              </Text>
              <Text style={{
                fontSize: 13,
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 18,
              }}>
                Paste a YouTube URL to fact-check every claim in the video transcript.
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
              {/* URL Input */}
              <View style={{
                backgroundColor: colors.backgroundAlt,
                borderRadius: borderRadius.md,
                borderWidth: 1,
                borderColor: url && !isValidUrl ? colors.verdictFalse : colors.border,
                padding: spacing.sm,
                marginBottom: spacing.sm,
              }}>
                <TextInput
                  placeholder="https://www.youtube.com/watch?v=..."
                  placeholderTextColor={colors.textMuted}
                  value={url}
                  onChangeText={(text) => { setUrl(text); setError(null); }}
                  editable={!isLoading}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  style={{
                    color: colors.textPrimary,
                    fontSize: 14,
                    minHeight: 36,
                    lineHeight: 20,
                  }}
                />
              </View>

              {(error || (url && !isValidUrl)) && (
                <Text style={{ fontSize: 11, color: colors.verdictFalse, marginBottom: spacing.sm }}>
                  {error || 'Enter a valid YouTube URL (youtube.com/watch, /shorts, or youtu.be)'}
                </Text>
              )}

              {/* Loading state */}
              {isLoading && (
                <View style={{ marginBottom: spacing.sm, alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
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
                  <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center' }}>
                    Fetching transcript...
                  </Text>
                </View>
              )}

              {/* Submit */}
              <Pressable
                onPress={handleSubmit}
                disabled={!isValidUrl || isLoading}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: !isValidUrl || isLoading ? colors.border : colors.primary,
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
                      Fact-Check Video
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
