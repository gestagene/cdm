
import { useEffect } from "react";
import { Stack } from "expo-router";
import { colors } from "../constants/theme";
import {
  initializeVerificationStorage,
} from "../utils/verificationFiles";

export default function RootLayout() {
  useEffect(() => {
    try {
      initializeVerificationStorage();
    } catch (error) {
      console.error(
        "STARTUP VERIFICATION CLEANUP FAILED:",
        error
      );
    }
  }, []);

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
