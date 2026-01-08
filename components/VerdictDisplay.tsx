import { View, Text, Pressable, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { useState, useRef } from 'react';
import type { Verdict, Source } from '../lib/types';
import { FormattedSummary } from './FormattedSummary';
import { SourceList } from './SourceList';

interface VerdictDisplayProps {
  verdict: Verdict;
  summary: string;
  sources: Source[];
  onReset?: () => void;
  hideActions?: boolean;
}

const verdictConfig: Record<
  Verdict,
  { icon: string; color: string; bgColor: string; borderColor: string }
> = {
  TRUE: {
    icon: '✓',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#22c55e',
  },
  FALSE: {
    icon: '✗',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
  },
  MISLEADING: {
    icon: '⚠',
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.1)',
    borderColor: '#eab308',
  },
  UNVERIFIED: {
    icon: '?',
    color: '#94a3b8',
    bgColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: '#64748b',
  },
};

export function VerdictDisplay({
  verdict,
  summary,
  sources,
  onReset,
  hideActions = false,
}: VerdictDisplayProps) {
  const [highlightedSource, setHighlightedSource] = useState<number | null>(null);
  const sourcesRef = useRef<ScrollView>(null);

  const normalizedVerdict = (verdict?.toUpperCase() as Verdict) || 'UNVERIFIED';
  const config = verdictConfig[normalizedVerdict] || verdictConfig.UNVERIFIED;
  const displayVerdict = verdictConfig[normalizedVerdict] ? normalizedVerdict : 'UNVERIFIED';

  const handleCitationClick = (index: number) => {
    setHighlightedSource(index);
    setTimeout(() => setHighlightedSource(null), 3000);
  };

  return (
    <ScrollView style={{ gap: 40 }}>
      {/* Verdict Badge */}
      <MotiView
        from={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 999, borderWidth: 2, backgroundColor: config.bgColor, borderColor: config.borderColor }}
      >
        <Text style={{ fontSize: 24 }}>{config.icon}</Text>
        <Text style={{ fontWeight: 'black', fontSize: 20, letterSpacing: 1.5, color: config.color }}>
          {displayVerdict}
        </Text>
      </MotiView>

      {/* Summary */}
      <MotiView
        from={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 300 }}
        style={{ gap: 16 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: '#64748b' }}>💬</Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, color: '#64748b' }}>
            AI Analysis
          </Text>
        </View>
        <View style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)', borderRadius: 8, padding: 24, borderLeftWidth: 4, borderLeftColor: 'rgba(59, 130, 246, 0.5)' }}>
          <FormattedSummary summary={summary} onCitationClick={handleCitationClick} />
        </View>
      </MotiView>

      {/* Sources */}
      <MotiView
        ref={sourcesRef}
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 400 }}
        style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 12, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <SourceList sources={sources} expanded highlightedIndex={highlightedSource} />
      </MotiView>

      {/* Actions */}
      {!hideActions && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 500, delay: 500 }}
          style={{ paddingTop: 32, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', flexDirection: 'column', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text style={{ fontSize: 12, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            ✓ AI Research Complete
          </Text>
          {onReset && (
            <Pressable
              onPress={onReset}
              style={{ paddingHorizontal: 24, paddingVertical: 12, backgroundColor: 'white', borderRadius: 4 }}
            >
              <Text style={{ color: 'black', fontWeight: 'black', fontSize: 14 }}>
                Check Another Claim
              </Text>
            </Pressable>
          )}
        </MotiView>
      )}
    </ScrollView>
  );
}
