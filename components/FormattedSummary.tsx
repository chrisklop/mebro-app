import { View, Text, Pressable } from 'react-native';
import { useCallback } from 'react';

interface FormattedSummaryProps {
  summary: string;
  onCitationClick?: (index: number) => void;
}

export function FormattedSummary({ summary, onCitationClick }: FormattedSummaryProps) {
  const renderFormattedText = useCallback(() => {
    const parts: (string | React.ReactElement)[] = [];
    let key = 0;
    let remaining = summary;

    const combinedRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[\d+\])/g;
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(summary)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(summary.slice(lastIndex, match.index));
      }

      const matchText = match[0];

      // Determine which pattern matched
      if (matchText.startsWith('**') && matchText.endsWith('**')) {
        // Bold
        const inner = matchText.slice(2, -2);
        parts.push(
          <Text key={key++} style={{ fontWeight: 'bold', color: 'white' }}>
            {inner}
          </Text>
        );
      } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
        // Italic
        const inner = matchText.slice(1, -1);
        parts.push(
          <Text key={key++} style={{ fontStyle: 'italic', color: '#cbd5e1' }}>
            {inner}
          </Text>
        );
      } else if (matchText.match(/^\[\d+\]$/)) {
        // Citation
        const num = matchText.slice(1, -1);
        const index = parseInt(num, 10) - 1;
        parts.push(
          <Pressable
            key={key++}
            onPress={() => onCitationClick?.(index)}
            style={{ marginHorizontal: 2, paddingHorizontal: 4, height: 20, backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#60a5fa', lineHeight: 14 }}>{num}</Text>
          </Pressable>
        );
      }

      lastIndex = match.index + matchText.length;
    }

    // Add remaining text
    if (lastIndex < summary.length) {
      parts.push(summary.slice(lastIndex));
    }

    return parts;
  }, [summary, onCitationClick]);

  return (
    <Text style={{ color: '#e2e8f0', lineHeight: 24, fontSize: 16, fontFamily: 'sans-serif' }}>
      {renderFormattedText()}
    </Text>
  );
}
