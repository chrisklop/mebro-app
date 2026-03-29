import { ScrollView, View, Text, Pressable, Linking, useWindowDimensions } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ExternalLink, AlertTriangle, Users, Zap, Link2 } from 'lucide-react-native';
import { getCogDissResult } from '../../lib/cogdiss-api';
import { colors, spacing, borderRadius, shadows, getVerdictStyle } from '../../lib/design';
import type { DualResult, CogDissBeneficiary, CogDissSourceLink } from '../../lib/cogdiss-types';

export default function CogResultScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [result, setResult] = useState<DualResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const fetchResult = async () => {
      let attempts = 0;
      const poll = async () => {
        if (cancelled) return;
        try {
          const res = await getCogDissResult(slug);
          if (res.success && res.result) {
            setResult(res.result);
            setLoading(false);
          } else if (res.error) {
            setError(res.error);
            setLoading(false);
          } else if (attempts < 30) {
            attempts++;
            setTimeout(poll, 3000);
          } else {
            setError('Analysis took too long. Try again.');
            setLoading(false);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Network error');
          setLoading(false);
        }
      };
      await poll();
    };
    fetchResult();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted, fontSize: 16, marginBottom: spacing.sm }}>Running dual analysis...</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>This may take up to 30 seconds</Text>
        </View>
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
            onPress={() => router.push('/cog')}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.lg,
              borderRadius: borderRadius.md,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ color: colors.textOnDark, fontWeight: '600' }}>Try Another Claim</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const verdictStyle = result.factCheck.verdict ? getVerdictStyle(result.factCheck.verdict) : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: colors.surfaceDark,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
      }}>
        <View style={{ maxWidth: 900, alignSelf: 'center', width: '100%' }}>
          <Text style={{
            fontSize: 11,
            fontWeight: '600',
            color: colors.textOnDarkMuted,
            letterSpacing: 1,
            marginBottom: spacing.xs,
          }}>
            DUAL ANALYSIS RESULT
          </Text>
          <Text style={{
            fontSize: 18,
            color: colors.textOnDark,
            fontStyle: 'italic',
            lineHeight: 26,
          }} numberOfLines={3}>
            "{result.factCheck.query}"
          </Text>
        </View>
      </View>

      {/* Side-by-side or stacked panes */}
      <View style={{
        flexDirection: isWide ? 'row' : 'column',
        padding: spacing.md,
        gap: spacing.md,
        maxWidth: 940,
        alignSelf: 'center',
        width: '100%',
      }}>
        {/* Left pane: Fact Check */}
        <View style={{
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
          ...shadows.md,
        }}>
          {/* Pane header */}
          <View style={{
            backgroundColor: colors.backgroundAlt,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}>
            <Text style={{
              fontSize: 11,
              fontWeight: '700',
              color: colors.textPrimary,
              letterSpacing: 1.5,
            }}>
              FACT CHECK VERDICT
            </Text>
          </View>

          <View style={{ padding: spacing.md }}>
            {/* Verdict badge */}
            {verdictStyle && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                <View style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: verdictStyle.color,
                  marginRight: spacing.sm,
                }} />
                <Text style={{ fontSize: 22, fontWeight: '800', color: verdictStyle.color }}>
                  {verdictStyle.label}
                </Text>
                {result.factCheck.confidence !== undefined && (
                  <Text style={{
                    fontSize: 13,
                    color: colors.textMuted,
                    marginLeft: spacing.sm,
                  }}>
                    {Math.round(result.factCheck.confidence * 100)}% confidence
                  </Text>
                )}
              </View>
            )}

            {/* TLDR */}
            {result.factCheck.tldr && (
              <Text style={{
                fontSize: 15,
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: spacing.sm,
                lineHeight: 22,
              }}>
                {result.factCheck.tldr}
              </Text>
            )}

            {/* Summary */}
            {result.factCheck.summary && (
              <View style={{
                backgroundColor: colors.backgroundAlt,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginBottom: spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: colors.textMuted,
                  marginBottom: spacing.xs,
                  letterSpacing: 0.5,
                }}>
                  SUMMARY
                </Text>
                <Text style={{ fontSize: 14, color: colors.textPrimary, lineHeight: 22 }}>
                  {result.factCheck.summary}
                </Text>
              </View>
            )}

            {/* Sources */}
            {result.factCheck.sources && result.factCheck.sources.length > 0 && (
              <View>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: colors.textMuted,
                  letterSpacing: 0.5,
                  marginBottom: spacing.sm,
                }}>
                  SOURCES ({result.factCheck.sources.length})
                </Text>
                {result.factCheck.sources.slice(0, 4).map((source, index) => (
                  <Pressable
                    key={index}
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
                    <ExternalLink color={colors.textMuted} size={13} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, color: colors.textPrimary, fontWeight: '500' }} numberOfLines={2}>
                        {source.title}
                      </Text>
                      {source.snippet && (
                        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2, lineHeight: 16 }} numberOfLines={2}>
                          {source.snippet}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Right pane: Disinformation Source Analysis */}
        <View style={{
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.verdictUnverified,
          overflow: 'hidden',
          ...shadows.md,
        }}>
          {/* Pane header */}
          <View style={{
            backgroundColor: colors.verdictUnverified,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
          }}>
            <Text style={{
              fontSize: 11,
              fontWeight: '700',
              color: colors.textOnDark,
              letterSpacing: 1.5,
            }}>
              DISINFO SOURCE ANALYSIS
            </Text>
          </View>

          <View style={{ padding: spacing.md }}>
            {/* Confidence */}
            {result.cogDiss.confidence !== undefined && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                <View style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.verdictUnverified,
                  marginRight: spacing.sm,
                }} />
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  Disinfo confidence:{' '}
                  <Text style={{ color: colors.verdictUnverified, fontWeight: '700' }}>
                    {Math.round(result.cogDiss.confidence * 100)}%
                  </Text>
                </Text>
              </View>
            )}

            {/* Narrative */}
            <View style={{
              backgroundColor: '#f3e8ff',
              borderRadius: borderRadius.md,
              padding: spacing.md,
              marginBottom: spacing.md,
              borderLeftWidth: 3,
              borderLeftColor: colors.verdictUnverified,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs, gap: spacing.xs }}>
                <AlertTriangle color={colors.verdictUnverified} size={14} />
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: colors.verdictUnverified,
                  letterSpacing: 0.5,
                }}>
                  NARRATIVE
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.textPrimary, lineHeight: 22 }}>
                {result.cogDiss.narrative}
              </Text>
            </View>

            {/* Who Benefits */}
            {result.cogDiss.beneficiaries && result.cogDiss.beneficiaries.length > 0 && (
              <View style={{ marginBottom: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.xs }}>
                  <Users color={colors.textMuted} size={13} />
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: colors.textMuted,
                    letterSpacing: 0.5,
                  }}>
                    WHO BENEFITS
                  </Text>
                </View>
                {result.cogDiss.beneficiaries.map((b: CogDissBeneficiary, i: number) => (
                  <View key={i} style={{
                    backgroundColor: colors.backgroundAlt,
                    borderRadius: borderRadius.sm,
                    padding: spacing.sm,
                    marginBottom: spacing.xs,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 }}>
                      {b.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>
                      {b.explanation}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tactics Used */}
            {result.cogDiss.tactics && result.cogDiss.tactics.length > 0 && (
              <View style={{ marginBottom: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.xs }}>
                  <Zap color={colors.textMuted} size={13} />
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: colors.textMuted,
                    letterSpacing: 0.5,
                  }}>
                    TACTICS USED
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                  {result.cogDiss.tactics.map((tactic: string, i: number) => (
                    <View key={i} style={{
                      backgroundColor: '#f3e8ff',
                      borderRadius: borderRadius.full,
                      paddingVertical: 4,
                      paddingHorizontal: spacing.sm,
                      borderWidth: 1,
                      borderColor: colors.verdictUnverified,
                    }}>
                      <Text style={{ fontSize: 11, color: colors.verdictUnverified, fontWeight: '500' }}>
                        {tactic}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Source Links */}
            {result.cogDiss.sourceLinks && result.cogDiss.sourceLinks.length > 0 && (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.xs }}>
                  <Link2 color={colors.textMuted} size={13} />
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: colors.textMuted,
                    letterSpacing: 0.5,
                  }}>
                    SOURCE LINKS
                  </Text>
                </View>
                {result.cogDiss.sourceLinks.map((link: CogDissSourceLink, i: number) => (
                  <Pressable
                    key={i}
                    onPress={() => Linking.openURL(link.url)}
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
                    <ExternalLink color={colors.verdictUnverified} size={13} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, color: colors.textPrimary, fontWeight: '500' }} numberOfLines={2}>
                        {link.title}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.verdictUnverified, marginTop: 2, lineHeight: 16 }} numberOfLines={2}>
                        {link.relevance}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={{ padding: spacing.lg, alignItems: 'center' }}>
        <Pressable onPress={() => router.push('/cog')}>
          <Text style={{ fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' }}>
            Analyze another claim
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
