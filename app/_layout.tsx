import { Stack } from 'expo-router';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavBar } from '../components/NavBar';
import { colors } from '../lib/design';
import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <NavBar />
          <View style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background, flex: 1 },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="index" options={{ title: 'Mebro - AI Fact Checking' }} />
              <Stack.Screen name="r/[slug]" options={{ title: 'Fact Check Result' }} />
            </Stack>
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}
