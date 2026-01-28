import { View, Text, Pressable, Linking, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import type { Source, SourceType } from '../lib/types';

interface SourceListProps {
  sources: Source[];
  expanded?: boolean;
  highlightedIndex?: number | null;
}

function getStars(score: number): number {
  if (score >= 95) return 5;
  if (score >= 85) return 4;
  if (score >= 70) return 3;
  if (score >= 50) return 2;
  return 1;
}

function getSourceTypeConfig(
  type: SourceType
): { label: string; icon: string; color: string } {
  switch (type) {
    case 'fact-checker':
      return { label: 'Fact-Checker', icon: '✓', color: '#22c55e' };
    case 'news':
      return { label: 'News', icon: '📰', color: '#60a5fa' };
    case 'academic':
      return { label: 'Academic', icon: '🎓', color: '#a78bfa' };
    case 'primary':
      return { label: 'Primary', icon: '🌍', color: '#06b6d4' };
    default:
      return { label: 'Source', icon: '◆', color: '#94a3b8' };
  }
}

function getCredibilityLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Highly Trusted', color: '#4ade80' };
  if (score >= 80) return { label: 'Trusted', color: '#60a5fa' };
  if (score >= 70) return { label: 'Moderate', color: '#facc15' };
  return { label: 'Verify Independently', color: '#fb923c' };
}

function addUtmParams(url: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', 'mebro');
    urlObj.searchParams.set('utm_medium', 'factcheck');
    urlObj.searchParams.set('utm_campaign', 'verification');
    return urlObj.toString();
  } catch {
    return url;
  }
}

export function SourceList({
  sources,
  expanded = false,
  highlightedIndex = null,
}: SourceListProps) {
  const [flashIndex, setFlashIndex] = useState<number | null>(null);

  // Flash animation effect when highlightedIndex changes
  useEffect(() => {
    if (highlightedIndex !== null) {
      setFlashIndex(highlightedIndex);
      let flashCount = 0;
      const flashInterval = setInterval(() => {
        setFlashIndex(prev => prev === null ? highlightedIndex : null);
        flashCount++;
        if (flashCount >= 6) { // 3 full flash cycles (on/off)
          clearInterval(flashInterval);
          setFlashIndex(highlightedIndex); // End with highlighted state
        }
      }, 300);
      return () => clearInterval(flashInterval);
    } else {
      setFlashIndex(null);
    }
  }, [highlightedIndex]);

  if (!sources || sources.length === 0) {
    return (
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: '#64748b' }}>🔗</Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, color: '#64748b' }}>
            Sources
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: '#475569', fontStyle: 'italic' }}>
          No external grounding sources available for this query.
        </Text>
      </View>
    );
  }

  if (expanded) {
    return (
      <View style={{ gap: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: '#94a3b8' }}>🔗</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, color: '#94a3b8' }}>
              Verified Sources
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: '#64748b', backgroundColor: '#1e293b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
            {sources.length} sources
          </Text>
        </View>

        <ScrollView style={{ gap: 12 }}>
          {sources.map((source, i) => {
            const stars = getStars(source.credibilityScore);
            const typeConfig = getSourceTypeConfig(source.type);
            const credibility = getCredibilityLabel(source.credibilityScore);
            const isFlashing = flashIndex === i;

            return (
              <Pressable
                key={i}
                onPress={() => Linking.openURL(addUtmParams(source.url))}
                style={{
                  padding: 16,
                  borderRadius: 8,
                  borderWidth: 2,
                  flexDirection: 'column',
                  gap: 12,
                  borderColor: isFlashing ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                  backgroundColor: isFlashing ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0,0,0,0.3)',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#94a3b8' }}>{i + 1}</Text>
                    </View>
                    <View style={{ padding: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text style={{ fontSize: 16, color: typeConfig.color }}>{typeConfig.icon}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Text key={j} style={{ fontSize: 12 }}>
                        {j < stars ? '⭐' : '☆'}
                      </Text>
                    ))}
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#e2e8f0', marginBottom: 4, numberOfLines: 2 }}>
                    {source.title}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 12, fontWeight: '500', color: typeConfig.color }}>
                      {typeConfig.label}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#475569' }}>•</Text>
                    <Text style={{ fontSize: 12, color: credibility.color }}>
                      {credibility.label}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
                  <Text style={{ fontSize: 12, color: '#64748b' }}>↗</Text>
                  <Text style={{ fontSize: 12, color: '#64748b', numberOfLines: 1 }}>
                    {new URL(source.url).hostname}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // Compact view
  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ color: '#64748b' }}>🔗</Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, color: '#64748b' }}>
          Sources ({sources.length})
        </Text>
      </View>
      <ScrollView style={{ gap: 8, maxHeight: 256 }}>
        {sources.map((source, i) => {
          const stars = getStars(source.credibilityScore);
          const typeConfig = getSourceTypeConfig(source.type);
          const isFlashing = flashIndex === i;

          return (
            <Pressable
              key={i}
              onPress={() => Linking.openURL(addUtmParams(source.url))}
              style={{
                padding: 12,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: isFlashing ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                backgroundColor: isFlashing ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <View style={{ gap: 4, flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#e2e8f0', numberOfLines: 2 }}>
                    {source.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '500', color: typeConfig.color }}>
                      {typeConfig.label}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Text key={j} style={{ fontSize: 12 }}>
                          {j < stars ? '⭐' : '☆'}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: '#64748b' }}>↗</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
