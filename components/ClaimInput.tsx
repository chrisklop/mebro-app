import { View, Text, TextInput, Pressable } from 'react-native';
import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react-native';
import type { Tone } from '../lib/types';

interface ClaimInputProps {
  onSubmit: (query: string, tone: Tone) => void;
  isLoading?: boolean;
}

export function ClaimInput({ onSubmit, isLoading = false }: ClaimInputProps) {
  const [query, setQuery] = useState('');
  const [tone, setTone] = useState<Tone>('snarky');

  const handleSubmit = () => {
    if (query.trim() && !isLoading) {
      onSubmit(query.trim(), tone);
    }
  };

  const tones: { key: Tone; label: string; emoji?: string }[] = [
    { key: 'academic', label: 'ACADEMIC' },
    { key: 'snarky', label: 'SNARKY', emoji: '✨' },
    { key: 'brutal', label: 'BRUTAL' },
  ];

  return (
    <View style={{ gap: 32, maxWidth: 700, alignSelf: 'center', width: '100%' }}>
      {/* Headline */}
      <View style={{ alignItems: 'center', gap: 16 }}>
        <Text style={{
          fontSize: 42,
          fontWeight: '900',
          color: 'white',
          textAlign: 'center',
          letterSpacing: -2,
        }}>
          TRUST ME BRO?
        </Text>
        <Text style={{
          fontSize: 42,
          fontWeight: '900',
          color: '#3b82f6',
          fontStyle: 'italic',
          textAlign: 'center',
          letterSpacing: -1,
        }}>
          LET'S CHECK.
        </Text>
        <Text style={{
          fontSize: 16,
          color: '#94a3b8',
          textAlign: 'center',
          lineHeight: 24,
          maxWidth: 500,
          paddingHorizontal: 16,
        }}>
          End the "trust me bro" era. Generate a shareable link that fact-checks any claim with AI-powered research and credible sources.
        </Text>
      </View>

      {/* Tone selector */}
      <View style={{ alignItems: 'center' }}>
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#0f172a',
          borderRadius: 8,
          padding: 4,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)',
        }}>
          {tones.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setTone(t.key)}
              disabled={isLoading}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 6,
                backgroundColor: tone === t.key ? '#2563eb' : 'transparent',
              }}
            >
              <Text style={{
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 1,
                color: tone === t.key ? 'white' : '#64748b',
              }}>
                {t.emoji ? `${t.emoji} ` : ''}{t.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Input container with glow effect */}
      <View style={{ position: 'relative' }}>
        {/* Glow effect */}
        <View style={{
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          backgroundColor: '#3b82f6',
          borderRadius: 18,
          opacity: 0.1,
        }} />

        {/* Main input container */}
        <View style={{
          backgroundColor: 'rgba(15,23,42,0.8)',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          padding: 8,
        }}>
          {/* Input row */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingHorizontal: 16,
            paddingTop: 8,
          }}>
            <Search color="#475569" size={20} style={{ marginRight: 12, marginTop: 4 }} />
            <TextInput
              multiline
              placeholder="Paste a claim, quote, or text snippet to fact-check..."
              placeholderTextColor="#475569"
              value={query}
              onChangeText={(text) => setQuery(text.slice(0, 2000))}
              editable={!isLoading}
              style={{
                flex: 1,
                color: 'white',
                fontSize: 18,
                minHeight: 60,
                paddingVertical: 8,
              }}
            />
          </View>

          {/* Bottom row with char count and button */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingBottom: 8,
            paddingTop: 4,
          }}>
            <Text style={{
              fontSize: 12,
              color: query.length > 1800 ? '#eab308' : '#475569',
            }}>
              {query.length}/2000
            </Text>

            <Pressable
              onPress={handleSubmit}
              disabled={!query.trim() || isLoading}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: !query.trim() || isLoading ? '#1e293b' : '#2563eb',
                paddingVertical: 14,
                paddingHorizontal: 24,
                borderRadius: 12,
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            >
              <Sparkles
                color={!query.trim() || isLoading ? '#64748b' : 'white'}
                size={18}
              />
              <Text style={{
                fontSize: 13,
                fontWeight: '900',
                letterSpacing: 1,
                color: !query.trim() || isLoading ? '#64748b' : 'white',
              }}>
                {isLoading ? 'CHECKING...' : 'FACT CHECK'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
