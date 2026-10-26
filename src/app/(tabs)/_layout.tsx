import { Tabs } from "expo-router";
import { House, CirclePlus, MessagesSquare, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";

const ICON_SIZE = 26;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: insets.bottom + 8,
          height: 56,
          paddingTop: 0,
          paddingBottom: 0,
          borderRadius: 28,
          borderTopWidth: 0,
          backgroundColor: colors.surface,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        },
        tabBarItemStyle: {
          height: 56,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 0,
        },
        tabBarIconStyle: { marginTop: 0, marginBottom: 0 },
        tabBarLabelStyle: { fontSize: 10, marginTop: 2, marginBottom: 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <House color={color} size={ICON_SIZE} />,
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: "Sell",
          tabBarIcon: ({ color }) => (
            <CirclePlus color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => (
            <MessagesSquare color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={ICON_SIZE} />,
        }}
      />
    </Tabs>
  );
}
