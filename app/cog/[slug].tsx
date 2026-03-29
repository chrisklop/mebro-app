import { ScrollView, View, Text, Pressable, Linking, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
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
    const fetchResult = async () => {
      try {
        let attempts = 0;
        const poll = async () => {
          const res = await getCogDissResult(slug);
          if (res.success && res.result) {
            setResult(res.result);
            setLoading(false);
          } else if (attempts < 30) {
            attempts++;
            setTimeout(poll, 3000);
          } else {
            setError('Analysis took too long. Try again.');
            setLoading(false);
          }
        };
        await poll();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
        setLoading(false);
      }
    };
    fetchResult();
  }, [slug]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surfaceDark, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.verdictUnverified} size="large" />
        <Text style={{ color: colors.textOnDarkMuted, marginTop: spacing.md, fontSize: 14 }}>
          Running dual analysis...
        </Text>
        <Text style={{ color: colors.textOnDarkMuted, fontSize: 12, marginTop: spacing.xs }}>
          This may take up to 30 seconds
        </Text>
      </View>
    );
  }

  if (error || !result) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surfaceDark, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
        <Text style={{ color: colors.verdictFalse, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm }}>
          {error || 'Result not found'}
        </Text>
        <Pressable
          onPress={() => router.push('/cog')}
          style={{
            backgroundColor: colors.verdictUnverified,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.md,
          }}
        >
          <Text style={{ color: colors.textOnDark, fontWeight: '600' }}>Try Another Claim</Text>
        </Pressable>
      </View>
    );
  }

  const verdictStyle = result.factCheck.verdict ? getVerdictStyle(result.factCheck.verdict) : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceDark }}>
      {/* Header bar */}
      <View style={{
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
      }}>
        <Text style={{
          fontSize: 11,
          fontWeight: '600',
          color: colors.verdictUnverified,
          letterSpacing: 2,
          marginBottom: spacing.xs,
        }}>
          DUAL ANALYSIS RESULT
        </Text>
        <Text style={{
          fontSize: 16,
          color: colors.textOnDark,
          fontStyle: 'italic',
          lineHeight: 22,
        }} numberOfLines={3}>
          "{result.factCheck.query}"
        </Text>
      </View>

      {/* Side-by-side or stacked panes */}
      <View style={{
        flexDirection: isWide ? 'row' : 'column',
        flex: 1,
        padding: spacing.md,
        gap: spacing.md,
      }}>
        {/* Left pane: Fact Check */}
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          {/* Pane header */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.06)',
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.06)',
          }}>
            <Text style={{
              fontSize: 11,
              fontWeight: '700',
              color: colors.textOnDarkMuted,
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
                    color: colors.textOnDarkMuted,
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
                color: colors.textOnDark,
                marginBottom: spacing.sm,
                lineHeight: 22,
              }}>
                {result.factCheck.tldr}
              </Text>
            )}

            {/* Summary */}
            {result.factCheck.summary && (
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginBottom: spacing.md,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.06)',
              }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: colors.textOnDarkMuted,
                  marginBottom: spacing.xs,
                  letterSpacing: 0.5,
                }}>
                  SUMMARY
                </Text>
                <Text style={{ fontSize: 14, color: colors.textOnDark, lineHeight: 22 }}>
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
                  color: colors.textOnDarkMuted,
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
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      borderRadius: borderRadius.sm,
                      gap: spacing.xs,
                    }}
                  >
                    <ExternalLink color={colors.textOnDarkMuted} size={13} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, color: colors.textOnDark, fontWeight: '500' }} numberOfLines={2}>
                        {source.title}
                      </Text>
                      {source.snippet && (
                        <Text style={{ fontSize: 11, color: colors.textOnDarkMuted, marginTop: 2, lineHeight: 16 }} numberOfLines={2}>
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
          backgroundColor: 'rgba(124,58,237,0.08)',
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          borderColor: 'rgba(124,58,237,0.25)',
          overflow: 'hidden',
        }}>
          {/* Pane header */}
          <View style={{
            backgroundColor: 'rgba(124,58,237,0.18)',
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(124,58,237,0.2)',
          }}>
            <Text style={{
              fontSize: 11,
              fontWeight: '700',
              color: colors.verdictUnverified,
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
                <Text style={{ fontSize: 13, color: colors.textOnDarkMuted }}>
                  Disinfo confidence:{' '}
                  <Text style={{ color: colors.verdictUnverified, fontWeight: '700' }}>
                    {Math.round(result.cogDiss.confidence * 100)}%
                  </Text>
                </Text>
              </View>
            )}

            {/* Narrative */}
            <View style={{
              backgroundColor: 'rgba(124,58,237,0.1)',
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
              <Text style={{ fontSize: 14, color: colors.textOnDark, lineHeight: 22 }}>
                {result.cogDiss.narrative}
              </Text>
            </View>

            {/* Who Benefits */}
            {result.cogDiss.beneficiaries && result.cogDiss.beneficiaries.length > 0 && (
              <View style={{ marginBottom: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.xs }}>
                  <Users color={colors.textOnDarkMuted} size={13} />
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: colors.textOnDarkMuted,
                    letterSpacing: 0.5,
                  }}>
                    WHO BENEFITS
                  </Text>
                </View>
                {result.cogDiss.beneficiaries.map((b: CogDissBeneficiary, i: number) => (
                  <View key={i} style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: borderRadius.sm,
                    padding: spacing.sm,
                    marginBottom: spacing.xs,
                    borderWidth: 1,
                    borderColor: 'rgba(124,58,237,0.15)',
                  }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textOnDark, marginBottom: 2 }}>
                      {b.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textOnDarkMuted, lineHeight: 18 }}>
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
                  <Zap color={colors.textOnDarkMuted} size={13} />
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: colors.textOnDarkMuted,
                    letterSpacing: 0.5,
                  }}>
                    TACTICS USED
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                  {result.cogDiss.tactics.map((tactic: string, i: number) => (
                    <View key={i} style={{
                      backgroundColor: 'rgba(124,58,237,0.2)',
                      borderRadius: borderRadius.full,
                      paddingVertical: 4,
                      paddingHorizontal: spacing.sm,
                      borderWidth: 1,
                      borderColor: 'rgba(124,58,237,0.35)',
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
                  <Link2 color={colors.textOnDarkMuted} size={13} />
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: colors.textOnDarkMuted,
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
                      backgroundColor: 'rgba(124,58,237,0.08)',
                      borderRadius: borderRadius.sm,
                      gap: spacing.xs,
                      borderWidth: 1,
                      borderColor: 'rgba(124,58,237,0.15)',
                    }}
                  >
                    <ExternalLink color={colors.verdictUnverified} size={13} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, color: colors.textOnDark, fontWeight: '500' }} numberOfLines={2}>
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
          <Text style={{ fontSize: 13, color: colors.textOnDarkMuted, textDecorationLine: 'underline' }}>
            Analyze another claim
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
