import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Screen
        name="login"
        options={({ route }) => ({
          animation: (route.params as any)?.from === 'link' ? 'slide_from_right' : 'slide_from_bottom',
          animationDuration: 400,
        })}
      />

      <Stack.Screen
        name="signup"
        options={({ route }) => ({
          animation: (route.params as any)?.from === 'link' ? 'slide_from_right' : 'slide_from_bottom',
          animationDuration: 400,
        })}
      />
    </Stack>
  );
}