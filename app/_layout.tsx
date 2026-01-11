import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavBar } from '../components/NavBar';
import { AuthProvider } from '../lib/auth';
import { colors } from '../lib/design';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <NavBar />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'none',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="r/[slug]" />
            <Stack.Screen name="login" />
            <Stack.Screen name="privacy" />
            <Stack.Screen name="account" />
          </Stack>
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
