import { View, Text } from 'react-native';

interface ResearchTerminalProps {
  children: React.ReactNode;
}

export function ResearchTerminal({ children }: ResearchTerminalProps) {
  return (
    <View style={{ borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)', padding: 24, overflow: 'hidden' }}>
      {/* Terminal header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#ef4444' }} />
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#eab308' }} />
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e' }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: '#64748b' }}>
            ◆ Fact Check Database
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={{ paddingTop: 24 }}>{children}</View>
    </View>
  );
}
