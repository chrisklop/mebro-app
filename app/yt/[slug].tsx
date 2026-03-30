import { ScrollView, View, Text, Pressable, Linking, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react-native';
import { getYouTubeResult } from '../../lib/youtube-api';
import type { YouTubeClaim, YouTubeAnalysisResult } from '../../lib/youtube-api';
import { colors, spacing, borderRadius, shadows, getVerdictStyle } from '../../lib/design';

function ClaimCard({ claim }: { claim: YouTubeClaim }) {
  const [expanded, setExpanded] = useState(false);
  const verdictStyle = getVerdictStyle(claim.verdict);

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.sm,
      overflow: 'hidden',
      ...shadows.md,
    }}>
      {/* Verdict strip */}
      <View style={{
        backgroundColor: verdictStyle?.bg || colors.backgroundAlt,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
      }}>
        <View style={{
          width: 8, height: 8, borderRadius: 4,
          backgroundColor: verdictStyle?.color || colors.textMuted,
        }} />
        <Text style={{
          fontSize: 11,
          fontWeight: '700',
          color: verdictStyle?.color || colors.textMuted,
          letterSpacing: 1,
        }}>
          {verdictStyle?.label || claim.verdict}
        </Text>
        <Text style={{ fontSize: 11, color: colors.textMuted, marginLeft: 'auto' }}>
          {claim.confidence}% confidence
        </Text>
      </View>

      <View style={{ padding: spacing.md }}>
        {/* Claim text */}
        <Text style={{
          fontSize: 14,
          fontStyle: 'italic',
          color: colors.textPrimary,
          lineHeight: 20,
          marginBottom: spacing.sm,
        }}>
          "{claim.claim}"
        </Text>

        {/* Explanation */}
        <Text style={{
          fontSize: 13,
          color: colors.textSecondary,
          lineHeight: 19,
        }}>
          {claim.explanation}
        </Text>

        {/* Sources toggle */}
        {claim.sources && claim.sources.length > 0 && (
          <Pressable
            onPress={() => setExpanded(!expanded)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: spacing.sm,
              gap: spacing.xs,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600' }}>
              {claim.sources.length} source{claim.sources.length !== 1 ? 's' : ''}
            </Text>
            {expanded
              ? <ChevronUp color={colors.textMuted} size={13} />
              : <ChevronDown color={colors.textMuted} size={13} />
            }
          </Pressable>
        )}

        {expanded && claim.sources && (
          <View style={{ marginTop: spacing.sm }}>
            {claim.sources.map((source, i) => (
              <Pressable
                key={i}
                onPress={() => Linking.openURL(source.url)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  padding: spacing.sm,
                  marginBottom: spacing.xs,
                  backgroundColor: colors.backgroundAlt,
                  borderRadius: borderRadius.sm,
                  gap: spacing.xs,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <ExternalLink color={colors.textMuted} size={12} style={{ marginTop: 2 }} />
                <Text style={{ flex: 1, fontSize: 12, color: colors.textPrimary }} numberOfLines={2}>
                  {source.title}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function VerdictSummary({ claims }: { claims: YouTubeClaim[] }) {
  const breakdown: Record<string, number> = {};
  for (const c of claims) {
    breakdown[c.verdict] = (breakdown[c.verdict] || 0) + 1;
  }
  const order = ['TRUE', 'FALSE', 'MISLEADING', 'UNVERIFIED'] as const;

  return (
    <View style={{
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    }}>
      {order.filter((v) => breakdown[v]).map((verdict) => {
        const vs = getVerdictStyle(verdict);
        return (
          <View key={verdict} style={{
            backgroundColor: vs?.bg || colors.backgroundAlt,
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.sm,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: vs?.color || colors.border,
          }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: vs?.color || colors.textMuted }}>
              {breakdown[verdict]} {vs?.label || verdict}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function YouTubeResultScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  const [result, setResult] = useState<YouTubeAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const poll = async (attempts = 0) => {
      if (cancelled) return;
      try {
        const res = await getYouTubeResult(slug);
        if (res.success && res.result) {
          setResult(res.result);
          setLoading(false);
        } else if (res.error) {
          setError(res.error);
          setLoading(false);
        } else if (attempts < 40) {
          setTimeout(() => poll(attempts + 1), 3000);
        } else {
          setError('Analysis took too long. Please try again.');
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
        setLoading(false);
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textMuted, fontSize: 16, marginBottom: spacing.sm }}>Analyzing transcript...</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>This may take up to 30 seconds</Text>
      </View>
    );
  }

  if (error || !result) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
        <View style={{
          backgroundColor: colors.surface,
          padding: spacing.xl,
          borderRadius: borderRadius.lg,
          maxWidth: 400,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{ color: colors.verdictFalse, fontSize: 18, fontWeight: '600', marginBottom: spacing.sm }}>
            {error || 'Result not found'}
          </Text>
          <Pressable
            onPress={() => router.push('/yt')}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.lg,
              borderRadius: borderRadius.md,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ color: colors.textOnDark, fontWeight: '600' }}>Try Another Video</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${result.videoId}/hqdefault.jpg`;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: colors.surfaceDark,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
      }}>
        <View style={{ maxWidth: 700, alignSelf: 'center', width: '100%' }}>
          <Text style={{
            fontSize: 11,
            fontWeight: '600',
            color: colors.textOnDarkMuted,
            letterSpacing: 1,
            marginBottom: spacing.sm,
          }}>
            YOUTUBE FACT-CHECK
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
            <Image
              source={{ uri: thumbnailUrl }}
              style={{ width: 120, height: 68, borderRadius: borderRadius.sm }}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: colors.textOnDarkMuted, marginBottom: spacing.xs }}>
                {result.claims.length} claim{result.claims.length !== 1 ? 's' : ''} analyzed
              </Text>
              <Text style={{ fontSize: 12, color: colors.textOnDarkMuted, fontFamily: 'monospace' }}>
                youtu.be/{result.videoId}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Claims list */}
      <View style={{ padding: spacing.md, maxWidth: 700, alignSelf: 'center', width: '100%' }}>
        <VerdictSummary claims={result.claims} />
        {result.claims.map((claim, i) => (
          <ClaimCard key={i} claim={claim} />
        ))}
      </View>

      {/* Footer */}
      <View style={{ padding: spacing.lg, alignItems: 'center' }}>
        <Pressable onPress={() => router.push('/yt')}>
          <Text style={{ fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' }}>
            Analyze another video
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
