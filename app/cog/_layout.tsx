import { Stack } from 'expo-router';
import { colors } from '../../lib/design';

export default function CogLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        contentStyle: { backgroundColor: colors.surfaceDark },
      }}
    />
  );
}
