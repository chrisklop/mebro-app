import { ScrollView, View, Text, Pressable, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CheckCircle, XCircle, AlertTriangle, HelpCircle,
  ExternalLink, Copy, Check, Share2
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { getClaim } from '../../lib/api';
import { colors, spacing, shadows, borderRadius, getVerdictStyle, getRandomSnarkyMessage } from '../../lib/design';
import type { Claim, Source } from '../../lib/types';

type Step = 'typing' | 'snarky' | 'reveal' | 'complete';

export default function ResultScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [step, setStep] = useState<Step>('typing');
  const [claim, setClaim] = useState<Claim | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [typedText, setTypedText] = useState('');
  const [snarkyMessage] = useState(getRandomSnarkyMessage());
  const [copied, setCopied] = useState(false);
  const [activeSourceTab, setActiveSourceTab] = useState(0);

  // Typing animation
  useEffect(() => {
    if (!claim?.query || step !== 'typing') return;

    let index = 0;
    const text = claim.query;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setTypedText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setStep('snarky'), 500);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [claim?.query, step]);

  // Snarky message delay
  useEffect(() => {
    if (step !== 'snarky') return;
    const timeout = setTimeout(() => setStep('reveal'), 2500);
    return () => clearTimeout(timeout);
  }, [step]);

  // Reveal animation delay
  useEffect(() => {
    if (step !== 'reveal') return;
    const timeout = setTimeout(() => setStep('complete'), 1000);
    return () => clearTimeout(timeout);
  }, [step]);

  // Fetch claim data
  useEffect(() => {
    if (!slug) return;

    const fetchClaim = async () => {
      try {
        const response = await getClaim(slug);

        if (response.success && response.claim) {
          setClaim(response.claim);

          if (response.claim.verdict) {
            setStep('typing');
          } else {
            let attempts = 0;
            const pollInterval = setInterval(async () => {
              attempts++;
              const pollResponse = await getClaim(slug);

              if (pollResponse.success && pollResponse.claim?.verdict) {
                setClaim(pollResponse.claim);
                clearInterval(pollInterval);
              } else if (attempts >= 60) {
                setError('Fact-checking took too long');
                clearInterval(pollInterval);
              }
            }, 2000);
          }
        } else {
          setError(response.error || 'Claim not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
      }
    };

    fetchClaim();
  }, [slug]);

  const handleCopyLink = async () => {
    const url = `https://lmdyrfy.vercel.app/r/${slug}`;
    await Clipboard.setStringAsync(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenSource = (url: string) => {
    Linking.openURL(url);
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'TRUE':
      case 'MOSTLY_TRUE':
        return <CheckCircle color={colors.verdictTrue} size={28} />;
      case 'FALSE':
      case 'MOSTLY_FALSE':
        return <XCircle color={colors.verdictFalse} size={28} />;
      case 'NUANCED':
      case 'MISLEADING':
        return <AlertTriangle color={colors.verdictNuanced} size={28} />;
      default:
        return <HelpCircle color={colors.verdictContext} size={28} />;
    }
  };

  // Loading state
  if (!claim) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: spacing.xxl, alignItems: 'center' }}>
          {error ? (
            <View style={{
              backgroundColor: colors.surface,
              padding: spacing.xl,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadows.md,
            }}>
              <Text style={{ color: colors.verdictFalse, fontSize: 18, fontWeight: '600', marginBottom: spacing.sm }}>
                Error
              </Text>
              <Text style={{ color: colors.textSecondary }}>{error}</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', gap: spacing.md }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <Text style={{ fontSize: 20 }}>...</Text>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>Loading fact check...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  const verdictStyle = claim.verdict ? getVerdictStyle(claim.verdict) : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Typing Animation Phase */}
      {(step === 'typing' || step === 'snarky') && (
        <View style={{ paddingBottom: spacing.xxl }}>
          {/* Dark typing section */}
          <View style={{
            backgroundColor: colors.surfaceDark,
            paddingVertical: spacing.xxxl,
            paddingHorizontal: spacing.lg,
          }}>
            <View style={{
              maxWidth: 700,
              alignSelf: 'center',
              width: '100%',
            }}>
              <Text style={{
                fontSize: 11,
                fontWeight: '600',
                color: colors.textOnDarkMuted,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: spacing.md,
              }}>
                Verifying claim...
              </Text>
              <Text style={{
                fontSize: 24,
                fontWeight: '500',
                color: colors.textOnDark,
                lineHeight: 34,
                fontStyle: 'italic',
              }}>
                "{typedText}"
                <Text style={{ color: colors.verdictTrue }}>|</Text>
              </Text>
            </View>
          </View>

          {/* Snarky Message */}
          {step === 'snarky' && (
            <View style={{
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.xl,
            }}>
              <View style={{
                maxWidth: 700,
                alignSelf: 'center',
                width: '100%',
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary,
                ...shadows.sm,
              }}>
                <Text style={{
                  fontSize: 17,
                  fontStyle: 'italic',
                  color: colors.textSecondary,
                  lineHeight: 26,
                }}>
                  {snarkyMessage}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Results - shown after reveal */}
      {(step === 'reveal' || step === 'complete') && verdictStyle && (
        <View>
          {/* Dark Verdict Panel */}
          <View style={{
            backgroundColor: colors.surfaceDark,
            paddingVertical: spacing.xxl,
            paddingHorizontal: spacing.lg,
          }}>
            <View style={{
              maxWidth: 700,
              alignSelf: 'center',
              width: '100%',
            }}>
              {/* The Claim */}
              <Text style={{
                fontSize: 11,
                fontWeight: '600',
                color: colors.textOnDarkMuted,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: spacing.xs,
              }}>
                Claim Analyzed
              </Text>
              <Text style={{
                fontSize: 20,
                fontWeight: '500',
                color: colors.textOnDark,
                fontStyle: 'italic',
                marginBottom: spacing.xl,
                lineHeight: 28,
              }}>
                "{claim.query}"
              </Text>

              {/* Verdict Badge */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
              }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: verdictStyle.color,
                }} />
                <Text style={{
                  fontSize: 36,
                  fontWeight: '800',
                  color: verdictStyle.color,
                  letterSpacing: -1,
                }}>
                  {verdictStyle.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Content Section - Khaki background */}
          <View style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
            paddingBottom: spacing.xxl,
          }}>
            <View style={{
              maxWidth: 700,
              alignSelf: 'center',
              width: '100%',
              gap: spacing.lg,
            }}>
              {/* Sources Section */}
              {claim.sources && claim.sources.length > 0 && (
                <View style={{
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: colors.border,
                  ...shadows.sm,
                }}>
                  <View style={{
                    padding: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor: colors.backgroundAlt,
                  }}>
                    <Text style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: colors.textPrimary,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                      Sources ({claim.sources.length})
                    </Text>
                  </View>

                  {/* Source Tabs */}
                  <View style={{
                    flexDirection: 'row',
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}>
                    {claim.sources.slice(0, 4).map((source: Source, index: number) => (
                      <Pressable
                        key={index}
                        onPress={() => setActiveSourceTab(index)}
                        style={{
                          flex: 1,
                          paddingVertical: spacing.sm,
                          paddingHorizontal: spacing.xs,
                          borderBottomWidth: 2,
                          borderBottomColor: activeSourceTab === index ? colors.primary : 'transparent',
                          backgroundColor: activeSourceTab === index ? colors.surface : colors.backgroundAlt,
                        }}
                      >
                        <Text style={{
                          fontSize: 12,
                          fontWeight: activeSourceTab === index ? '600' : '400',
                          color: activeSourceTab === index ? colors.textPrimary : colors.textMuted,
                          textAlign: 'center',
                        }} numberOfLines={1}>
                          {source.title || `Source ${index + 1}`}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Active Source Content */}
                  {claim.sources[activeSourceTab] && (
                    <View style={{ padding: spacing.md }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: colors.textPrimary,
                        marginBottom: spacing.xs,
                      }}>
                        {claim.sources[activeSourceTab].title}
                      </Text>
                      {claim.sources[activeSourceTab].snippet && (
                        <Text style={{
                          fontSize: 14,
                          color: colors.textSecondary,
                          lineHeight: 22,
                          marginBottom: spacing.md,
                        }}>
                          {claim.sources[activeSourceTab].snippet}
                        </Text>
                      )}
                      <Pressable
                        onPress={() => handleOpenSource(claim.sources![activeSourceTab].url)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: spacing.xs,
                        }}
                      >
                        <ExternalLink color={colors.textSecondary} size={14} />
                        <Text style={{
                          fontSize: 13,
                          color: colors.textSecondary,
                          fontWeight: '500',
                          textDecorationLine: 'underline',
                        }}>
                          View Source
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}

              {/* Summary */}
              {claim.summary && (
                <View style={{
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  padding: spacing.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  ...shadows.sm,
                }}>
                  <Text style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: colors.textMuted,
                    marginBottom: spacing.md,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                    Summary
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: colors.textPrimary,
                    lineHeight: 26,
                  }}>
                    {claim.summary}
                  </Text>
                </View>
              )}

              {/* Share Section */}
              <View style={{
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                borderWidth: 1,
                borderColor: colors.border,
                ...shadows.sm,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  marginBottom: spacing.md,
                }}>
                  <Share2 color={colors.textPrimary} size={18} />
                  <Text style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: colors.textPrimary,
                  }}>
                    Share this fact-check
                  </Text>
                </View>
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: spacing.md,
                }}>
                  Send this link to shut down misinformation with receipts.
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Pressable
                    onPress={handleCopyLink}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      backgroundColor: copied ? colors.verdictTrue : colors.primary,
                      paddingVertical: spacing.sm + 2,
                      paddingHorizontal: spacing.md,
                      borderRadius: borderRadius.md,
                    }}
                  >
                    {copied ? <Check color={colors.textOnDark} size={16} /> : <Copy color={colors.textOnDark} size={16} />}
                    <Text style={{ color: colors.textOnDark, fontWeight: '600', fontSize: 14 }}>
                      {copied ? 'Copied!' : 'Copy Link'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
