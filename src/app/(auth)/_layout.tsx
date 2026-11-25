import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animationDuration: 250 }}>
      <Stack.Screen name="index" />

      <Stack.Screen
        name="login"
        options={({ route }) => ({
          animation: (route.params as any)?.from === 'link' ? 'simple_push' : 'slide_from_bottom',
        })}
      />

      <Stack.Screen
        name="signup"
        options={({ route }) => ({
          animation: (route.params as any)?.from === 'link' ? 'simple_push' : 'slide_from_bottom',
        })}
      />
    </Stack>
  );
}