
import { Stack } from "expo-router";
import { colors } from "../constants/theme";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    />
  );
}
