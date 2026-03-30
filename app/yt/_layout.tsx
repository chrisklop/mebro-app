import { Stack } from 'expo-router';
import { colors } from '../../lib/design';

export default function YTLayout() {
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
