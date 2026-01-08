import { View, Text, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';

interface SearchLogsProps {
  isSearching: boolean;
  onLogsComplete?: () => void;
}

const FAKE_LOGS = [
  'Searching fact-checkers...',
  'Checking Snopes, PolitiFact, Reuters Fact Check...',
  'Scanning academic sources...',
  'Reviewing CDC, WHO, government sources...',
  'Analyzing primary research...',
  'Cross-referencing credible news outlets...',
  'Synthesizing findings...',
];

export function SearchLogs({ isSearching, onLogsComplete }: SearchLogsProps) {
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isSearching) {
      setDisplayedLogs([]);
      setProgress(0);
      return;
    }

    let logIndex = 0;
    let progressValue = 0;

    const logInterval = setInterval(() => {
      if (logIndex < FAKE_LOGS.length) {
        setDisplayedLogs((prev) => [...prev, FAKE_LOGS[logIndex]]);
        logIndex++;
        progressValue = (logIndex / FAKE_LOGS.length) * 100;
        setProgress(progressValue);
      } else {
        clearInterval(logInterval);
        onLogsComplete?.();
      }
    }, 600);

    return () => clearInterval(logInterval);
  }, [isSearching, onLogsComplete]);

  if (!isSearching && displayedLogs.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: 16 }}>
      {/* Progress bar */}
      <View style={{ height: 4, backgroundColor: '#1e293b', borderRadius: 999, overflow: 'hidden' }}>
        <MotiView
          from={{ width: '0%' }}
          animate={{ width: `${Math.min(progress, 95)}%` }}
          transition={{ type: 'timing', duration: 500 }}
          style={{ height: '100%', backgroundColor: '#3b82f6' }}
        />
      </View>

      {/* Logs */}
      <ScrollView style={{ maxHeight: 192, gap: 8 }}>
        {displayedLogs.map((log, i) => (
          <MotiView
            key={i}
            from={{ opacity: 0, translateX: -10 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 300 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
              <Text style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: 14 }}>▸</Text>
              <Text style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>{log}</Text>
            </View>
          </MotiView>
        ))}
      </ScrollView>

      {!isSearching && (
        <View style={{ alignItems: 'center', paddingTop: 8 }}>
          <Text style={{ fontSize: 12, color: '#64748b', fontWeight: 'bold' }}>✓ Analysis Complete</Text>
        </View>
      )}
    </View>
  );
}
