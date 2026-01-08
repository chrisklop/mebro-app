import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { useState, useEffect } from 'react';

interface TypingAnimationProps {
  text: string;
  onComplete: () => void;
}

export function TypingAnimation({ text, onComplete }: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) {
      onComplete();
      return;
    }

    if (displayText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, 50);

      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
    }
  }, [displayText, text, isComplete, onComplete]);

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>{displayText}</Text>
        {!isComplete && (
          <MotiView
            from={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 800, loop: true }}
            style={{ width: 4, height: 24, backgroundColor: '#3b82f6' }}
          />
        )}
      </View>
    </View>
  );
}
