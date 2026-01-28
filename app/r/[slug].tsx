import { ScrollView, View, Text, Pressable, Linking, Platform, Share } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import {
  ExternalLink, Copy, Check, Send, MessageSquare, Mail, Twitter, Eye
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { getClaim } from '../../lib/api';
import { API_BASE } from '../../lib/constants';
import { colors, spacing, shadows, borderRadius, getVerdictStyle, getRandomSnarkyMessage } from '../../lib/design';
import type { Claim, Source } from '../../lib/types';

type Step = 'loading' | 'typing' | 'snarky' | 'reveal' | 'complete';

export default function ResultScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const [step, setStep] = useState<Step>('loading');
  const [claim, setClaim] = useState<Claim | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [typedText, setTypedText] = useState('');
  const [snarkyMessage] = useState(getRandomSnarkyMessage());
  const [copied, setCopied] = useState(false);
  const [activeSourceTab, setActiveSourceTab] = useState(0);
  const isSharedLink = useRef<boolean | null>(null);
  const [viewCount, setViewCount] = useState<number>(0);
  const viewTracked = useRef(false);

  // Track view for gamification
  const trackView = useCallback(async () => {
    if (viewTracked.current || !slug) return;
    viewTracked.current = true;
    try {
      const response = await fetch(`${API_BASE}/claims/${slug}/view`, { method: 'POST' });
      const data = await response.json();
      if (data.success && data.viewCount !== undefined) {
        setViewCount(data.viewCount);
      }
    } catch {
      // Silent fail
    }
  }, [slug]);

  // Detect if this is a shared link
  useEffect(() => {
    if (isSharedLink.current === null) {
      const canGoBack = navigation.canGoBack();
      isSharedLink.current = !canGoBack;
    }
  }, [navigation]);

  // Fetch claim
  useEffect(() => {
    if (!slug) return;
    const fetchClaim = async () => {
      try {
        const response = await getClaim(slug);
        if (response.success && response.claim) {
          setClaim(response.claim);
          if (response.claim.verdict) {
            if (isSharedLink.current) {
              setStep('complete');
            } else {
              setStep('typing');
            }
          } else {
            let attempts = 0;
            const pollInterval = setInterval(async () => {
              attempts++;
              const pollResponse = await getClaim(slug);
              if (pollResponse.success && pollResponse.claim?.verdict) {
                setClaim(pollResponse.claim);
                setStep('typing');
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

  // Snarky -> reveal
  useEffect(() => {
    if (step !== 'snarky') return;
    const timeout = setTimeout(() => setStep('reveal'), 2500);
    return () => clearTimeout(timeout);
  }, [step]);

  // Reveal -> complete
  useEffect(() => {
    if (step !== 'reveal') return;
    const timeout = setTimeout(() => setStep('complete'), 1000);
    return () => clearTimeout(timeout);
  }, [step]);

  // Track view for gamification (once claim is loaded)
  useEffect(() => {
    if (claim && !viewTracked.current) {
      trackView();
      // Set initial view count from claim if available
      setViewCount((claim as any).view_count || 0);
    }
  }, [claim, trackView]);

  const shareUrl = `https://lmdyrfy.vercel.app/r/${slug}`;
  const verdictStyle = claim?.verdict ? getVerdictStyle(claim.verdict) : null;
  const verdictLabel = verdictStyle?.label || 'Checked';

  // Track share (placeholder - will connect to backend in Phase 2)
  const trackShare = async (method: string) => {
    try {
      await fetch(`${API_BASE}/claims/${slug}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method }),
      });
    } catch (e) {
      // Silent fail
    }
  };

  // Share handlers
  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: `"${claim?.query}" - Verdict: ${verdictLabel}\n\nFact-checked on Mebro:\n${shareUrl}`,
        url: shareUrl,
        title: 'Share Fact Check',
      });
      trackShare('native');
    } catch (err) {
      // User cancelled
    }
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackShare('copy');
  };

  const handleSMS = () => {
    const body = encodeURIComponent(
      `This claim is ${verdictLabel}: "${claim?.query}"\n\nSee the fact-check: ${shareUrl}`
    );
    Linking.openURL(`sms:?body=${body}`);
    trackShare('sms');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(
      `"${claim?.query?.slice(0, 100)}${(claim?.query?.length || 0) > 100 ? '...' : ''}" is ${verdictLabel}\n\nFact-checked with sources:`
    );
    Linking.openURL(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`);
    trackShare('twitter');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Fact Check: ${claim?.query?.slice(0, 50)}...`);
    const body = encodeURIComponent(
      `I thought you should see this fact-check:\n\n"${claim?.query}"\n\nVerdict: ${verdictLabel}\n\nSee the sources: ${shareUrl}`
    );
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
    trackShare('email');
  };

  const handleOpenSource = (url: string) => {
    Linking.openURL(url);
  };

  // Loading state
  if (step === 'loading' || !claim) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        {error ? (
          <View style={{
            backgroundColor: colors.surface,
            padding: spacing.xl,
            borderRadius: borderRadius.lg,
            margin: spacing.lg,
            maxWidth: 400,
          }}>
            <Text style={{ color: colors.verdictFalse, fontSize: 18, fontWeight: '600', marginBottom: spacing.sm }}>
              Error
            </Text>
            <Text style={{ color: colors.textSecondary, marginBottom: spacing.lg }}>{error}</Text>
            <Pressable
              onPress={() => router.push('/')}
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
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: colors.textMuted, fontSize: 16, marginBottom: spacing.sm }}>Loading fact check...</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>This may take a moment</Text>
          </View>
        )}
      </View>
    );
  }

  // Typing/snarky animation phase
  if (step === 'typing' || step === 'snarky' || step === 'reveal') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surfaceDark, justifyContent: 'center', paddingHorizontal: spacing.lg }}>
        <View style={{ maxWidth: 600, alignSelf: 'center', width: '100%' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textOnDarkMuted, letterSpacing: 1, marginBottom: spacing.md }}>
            VERIFYING CLAIM...
          </Text>
          <Text style={{ fontSize: 22, color: colors.textOnDark, fontStyle: 'italic', lineHeight: 32 }}>
            "{typedText}"
            {step === 'typing' && <Text style={{ color: colors.verdictTrue }}>|</Text>}
          </Text>
          {step === 'snarky' && (
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              marginTop: spacing.xl,
              borderLeftWidth: 4,
              borderLeftColor: colors.textOnDark,
            }}>
              <Text style={{ fontSize: 16, fontStyle: 'italic', color: colors.textOnDarkMuted, lineHeight: 24 }}>
                {snarkyMessage}
              </Text>
            </View>
          )}
          {step === 'reveal' && verdictStyle && (
            <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: verdictStyle.color, marginBottom: spacing.sm }} />
              <Text style={{ fontSize: 42, fontWeight: '800', color: verdictStyle.color }}>
                {verdictStyle.label}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  if (!verdictStyle) return null;

  // View count from gamification tracking

  // Complete state - show full result with viral share section
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Verdict Header */}
      <View style={{ backgroundColor: colors.surfaceDark, paddingVertical: spacing.xl, paddingHorizontal: spacing.lg }}>
        <View style={{ maxWidth: 600, alignSelf: 'center', width: '100%' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textOnDarkMuted, letterSpacing: 1, marginBottom: spacing.xs }}>
            FACT CHECK RESULT
          </Text>
          <Text style={{ fontSize: 18, color: colors.textOnDark, fontStyle: 'italic', marginBottom: spacing.lg, lineHeight: 26 }}>
            "{claim.query}"
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl }}>
            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: verdictStyle.color, marginRight: spacing.sm }} />
            <Text style={{ fontSize: 32, fontWeight: '800', color: verdictStyle.color }}>
              {verdictStyle.label}
            </Text>
          </View>

          {/* VIRAL SHARE SECTION */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '800',
              color: colors.textOnDark,
              letterSpacing: 1,
              marginBottom: spacing.xs,
            }}>
              SEND THE RECEIPTS
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textOnDarkMuted,
              marginBottom: spacing.md,
              lineHeight: 20,
            }}>
              Stop misinformation in its tracks. Share before they spread this again.
            </Text>

            {/* Primary Share Button */}
            <Pressable
              onPress={handleNativeShare}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.textOnDark,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.md,
                marginBottom: spacing.md,
                gap: spacing.sm,
              }}
            >
              <Send color={colors.surfaceDark} size={20} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.surfaceDark }}>
                Share Now
              </Text>
            </Pressable>

            {/* Secondary Share Options */}
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <ShareButton
                icon={Copy}
                label={copied ? 'Copied!' : 'Copy'}
                onPress={handleCopyLink}
                active={copied}
              />
              <ShareButton icon={MessageSquare} label="Text" onPress={handleSMS} />
              <ShareButton icon={Twitter} label="Tweet" onPress={handleTwitter} />
              <ShareButton icon={Mail} label="Email" onPress={handleEmail} />
            </View>

            {/* Social Proof */}
            {viewCount > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.md, gap: 6 }}>
                <Eye color={colors.textOnDarkMuted} size={14} />
                <Text style={{
                  fontSize: 12,
                  color: colors.textOnDarkMuted,
                  textAlign: 'center',
                }}>
                  {viewCount} {viewCount === 1 ? 'view' : 'views'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={{ maxWidth: 600, alignSelf: 'center', width: '100%' }}>

          {/* Summary */}
          {claim.summary && (
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: spacing.lg,
            }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.sm, letterSpacing: 0.5 }}>
                SUMMARY
              </Text>
              {claim.tldr && (
                <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm, lineHeight: 24 }}>
                  {claim.tldr}
                </Text>
              )}
              <Text style={{ fontSize: 15, color: colors.textPrimary, lineHeight: 24 }}>
                {claim.summary}
              </Text>
            </View>
          )}

          {/* Sources */}
          {claim.sources && claim.sources.length > 0 && (
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: spacing.lg,
            }}>
              <View style={{ padding: spacing.md, backgroundColor: colors.backgroundAlt, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textPrimary, letterSpacing: 0.5 }}>
                  SOURCES ({claim.sources.length})
                </Text>
              </View>
              <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                {claim.sources.slice(0, 4).map((source: Source, index: number) => (
                  <Pressable
                    key={index}
                    onPress={() => setActiveSourceTab(index)}
                    style={{
                      flex: 1,
                      paddingVertical: spacing.sm,
                      borderBottomWidth: 2,
                      borderBottomColor: activeSourceTab === index ? colors.primary : 'transparent',
                      backgroundColor: activeSourceTab === index ? colors.surface : colors.backgroundAlt,
                    }}
                  >
                    <Text style={{
                      fontSize: 11,
                      fontWeight: activeSourceTab === index ? '600' : '400',
                      color: activeSourceTab === index ? colors.textPrimary : colors.textMuted,
                      textAlign: 'center',
                    }} numberOfLines={1}>
                      {index + 1}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {claim.sources[activeSourceTab] && (
                <View style={{ padding: spacing.md }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs }}>
                    {claim.sources[activeSourceTab].title}
                  </Text>
                  {claim.sources[activeSourceTab].snippet && (
                    <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }}>
                      {claim.sources[activeSourceTab].snippet}
                    </Text>
                  )}
                  <Pressable
                    onPress={() => handleOpenSource(claim.sources![activeSourceTab].url)}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <ExternalLink color={colors.textMuted} size={14} style={{ marginRight: spacing.xs }} />
                    <Text style={{ fontSize: 13, color: colors.textMuted }}>
                      View source
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}

          {/* Bottom Share CTA */}
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs, textAlign: 'center' }}>
              Know someone who needs to see this?
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: spacing.md, textAlign: 'center' }}>
              Don't let them say "trust me bro" - send the receipts.
            </Text>
            <Pressable
              onPress={handleNativeShare}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.primary,
                paddingVertical: spacing.sm + 2,
                paddingHorizontal: spacing.xl,
                borderRadius: borderRadius.md,
                gap: spacing.sm,
              }}
            >
              <Send color={colors.textOnDark} size={18} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textOnDark }}>
                Share Fact Check
              </Text>
            </Pressable>
          </View>

          {/* New check link */}
          <Pressable
            onPress={() => router.push('/')}
            style={{ marginTop: spacing.lg, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' }}>
              Check another claim
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

// Secondary share button component
function ShareButton({
  icon: Icon,
  label,
  onPress,
  active = false,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? colors.verdictTrue : 'rgba(255,255,255,0.15)',
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        gap: 4,
      }}
    >
      <Icon color={colors.textOnDark} size={18} />
      <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textOnDark }}>
        {label}
      </Text>
    </Pressable>
  );
}
