import { View, Text, StyleSheet, Pressable } from "react-native";
import type { Listing } from "@/types/listing";
import { colors } from "../constants/theme";

interface ListedItemProps {
  listing: Listing;
  onClick: () => void;
}

/* ---------- Condition Colors ---------- */

const CONDITION_COLORS: Record<
  Listing["condition"],
  { bg: string; fg: string }
> = {
  New: {
    bg: "#D9F7E2",
    fg: "#0B5A2B",
  },
  "Like New": {
    bg: "#D9F7E2",
    fg: "#0B5A2B",
  },
  Good: {
    bg: "#D9F7E2",
    fg: "#2E7D4F",
  },
  Fair: {
    bg: "#FFEFB8",
    fg: "#8A6A00",
  },
};

export default function ListedItem({ listing, onClick }: ListedItemProps) {
  const badge = CONDITION_COLORS[listing.condition];

  return (
    <Pressable style={styles.card} onPress={onClick}>
      {/* Image Placeholder */}
      <View style={styles.imagePlaceholder} />

      {/* Product Information */}
      <View style={styles.cardBody}>
        <Text style={styles.price}>₱ {listing.price}</Text>

        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>

        {/* Condition */}
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.fg }]}>
            {listing.condition}
          </Text>
        </View>

        <Text style={styles.category}>{listing.category}</Text>
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
