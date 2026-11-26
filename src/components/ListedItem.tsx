
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";

import { colors } from "../constants/theme";

/* ---------- Types ---------- */

export type Condition =
  | "Like New"
  | "Used - Good"
  | "Used - Fair";

interface ListedItemProps {
  title: string;
  price: number;
  condition: Condition;
  category: string;
  onClick: () => void;
}

/* ---------- Condition Colors ---------- */

const CONDITION_COLORS: Record<
  Condition,
  { bg: string; fg: string }
> = {
  "Like New": {
    bg: "#D9F7E2",
    fg: "#0B5A2B",
  },
  "Used - Good": {
    bg: "#D9F7E2",
    fg: "#2E7D4F",
  },
  "Used - Fair": {
    bg: "#FFEFB8",
    fg: "#8A6A00",
  },
};

/* ---------- Component ---------- */

export default function ListedItem({
  title,
  price,
  condition,
  category,
  onClick,
}: ListedItemProps) {
  const badge = CONDITION_COLORS[condition];

  return (
    <Pressable
      style={styles.card}
      onPress={onClick}
    >
      {/* Image Placeholder */}
      <View style={styles.imagePlaceholder} />

      {/* Product Information */}
      <View style={styles.cardBody}>
        <Text style={styles.price}>
          ₱ {price.toLocaleString("en-PH")}
        </Text>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {/* Condition */}
        <View
          style={[
            styles.badge,
            { backgroundColor: badge.bg },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: badge.fg },
            ]}
          >
            {condition}
          </Text>
        </View>

        <Text style={styles.category}>
          {category}
        </Text>
      </View>
    </Pressable>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    overflow: "hidden",
  },

  imagePlaceholder: {
    width: "100%",
    height: 100,
    backgroundColor: colors.border,
  },

  cardBody: {
    padding: 8,
    gap: 2,
  },

  price: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },

  title: {
    fontSize: 12,
    color: colors.text,
  },

  badge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },

  category: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
});
