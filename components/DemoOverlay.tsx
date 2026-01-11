import { View, Text, Pressable, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { X, Sparkles } from 'lucide-react-native';
import { colors, spacing, borderRadius, shadows } from '../lib/design';
import type { Claim } from '../lib/types';

interface DemoOverlayProps {
  claim: Claim;
  onSkip: () => void;
  onComplete: () => void;
}

type DemoStep = 'intro' | 'typing' | 'notice' | 'highlight' | 'navigating';

export function DemoOverlay({ claim, onSkip, onComplete }: DemoOverlayProps) {
  const router = useRouter();
  const [step, setStep] = useState<DemoStep>('intro');
  const [typedText, setTypedText] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Intro fade in
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Start typing after intro
    const timer = setTimeout(() => setStep('typing'), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Typing animation
  useEffect(() => {
    if (step !== 'typing') return;

    const text = claim.query;
    let index = 0;

    const interval = setInterval(() => {
      if (index <= text.length) {
        setTypedText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setStep('notice'), 500);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [step, claim.query]);

  // Notice -> highlight
  useEffect(() => {
    if (step !== 'notice') return;
    const timer = setTimeout(() => setStep('highlight'), 2000);
    return () => clearTimeout(timer);
  }, [step]);

  // Button pulse animation
  useEffect(() => {
    if (step !== 'highlight') return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Auto-navigate after pulse
    const timer = setTimeout(() => {
      setStep('navigating');
      setTimeout(onComplete, 500);
    }, 2500);

    return () => {
      pulse.stop();
      clearTimeout(timer);
    };
  }, [step]);

  return (
    <Animated.View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background,
      opacity: fadeAnim,
      zIndex: 100,
    }}>
      {/* Skip button */}
      <Pressable
        onPress={onSkip}
        style={{
          position: 'absolute',
          top: spacing.lg,
          right: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: borderRadius.full,
          zIndex: 101,
          ...shadows.sm,
        }}
      >
        <X color={colors.textMuted} size={16} />
        <Text style={{ marginLeft: spacing.xs, color: colors.textMuted, fontSize: 13 }}>
          Skip Demo
        </Text>
      </Pressable>

      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
      }}>
        {/* Intro Step */}
        {step === 'intro' && (
          <View style={{ alignItems: 'center' }}>
            <Sparkles color={colors.textPrimary} size={48} style={{ marginBottom: spacing.lg }} />
            <Text style={{
              fontSize: 28,
              fontWeight: '700',
              color: colors.textPrimary,
              textAlign: 'center',
              marginBottom: spacing.sm,
            }}>
              See how it works
            </Text>
            <Text style={{
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: 'center',
            }}>
              Watch how easy it is to fact-check any claim
            </Text>
          </View>
        )}

        {/* Typing Step & Beyond */}
        {(step === 'typing' || step === 'notice' || step === 'highlight' || step === 'navigating') && (
          <View style={{ width: '100%', maxWidth: 500 }}>
            {/* Mini hero */}
            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
              <Text style={{
                fontSize: 48,
                fontWeight: '900',
                color: colors.textPrimary,
                textShadowColor: '#d4a547',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 15,
              }}>
                MEBRO
              </Text>
            </View>

            {/* Demo input card */}
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: borderRadius.xl,
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadows.lg,
            }}>
              {/* Fake input */}
              <View style={{
                backgroundColor: colors.backgroundAlt,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginBottom: spacing.md,
                minHeight: 80,
              }}>
                <Text style={{
                  fontSize: 16,
                  color: colors.textPrimary,
                  lineHeight: 24,
                }}>
                  {typedText}
                  {step === 'typing' && <Text style={{ color: colors.textMuted }}>|</Text>}
                </Text>
              </View>

              {/* Notice message */}
              {(step === 'notice' || step === 'highlight' || step === 'navigating') && (
                <View style={{
                  backgroundColor: colors.verdictTrue + '20',
                  padding: spacing.sm,
                  borderRadius: borderRadius.sm,
                  marginBottom: spacing.md,
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: colors.verdictTrue,
                    textAlign: 'center',
                    fontWeight: '600',
                  }}>
                    It's this easy to fact check!
                  </Text>
                </View>
              )}

              {/* Fake button */}
              <Animated.View style={{
                transform: [{ scale: step === 'highlight' ? pulseAnim : 1 }],
              }}>
                <View style={{
                  backgroundColor: step === 'highlight' || step === 'navigating'
                    ? colors.verdictTrue
                    : colors.primary,
                  paddingVertical: spacing.md,
                  borderRadius: borderRadius.md,
                  alignItems: 'center',
                  ...(step === 'highlight' ? {
                    shadowColor: colors.verdictTrue,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 10,
                  } : {}),
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.textOnDark,
                  }}>
                    {step === 'navigating' ? 'Checking...' : 'Fact Check This'}
                  </Text>
                </View>
              </Animated.View>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
