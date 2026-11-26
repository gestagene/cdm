
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/theme";

/* ---------- Types ---------- */

type Condition =
  | "Like New"
  | "Used - Good"
  | "Used - Fair";

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

/* ---------- Screen ---------- */

export default function ItemScreen() {
  const [search, setSearch] = useState("");

  const {
    id,
    title,
    description,
    price,
    condition,
    category,
  } = useLocalSearchParams<{
    id?: string;
    title?: string;
    description?: string;
    price?: string;
    condition?: string;
    category?: string;
  }>();

  /* ---------- Search Navigation ---------- */

  const handleSearch = () => {
    const query = search.trim();

    router.replace({
      pathname: "/(tabs)",
      params: {
        search: query,
      },
    });
  };

  /* ---------- Product Condition ---------- */

  const validConditions: Condition[] = [
    "Like New",
    "Used - Good",
    "Used - Fair",
  ];

  const productCondition: Condition =
    validConditions.includes(condition as Condition)
      ? (condition as Condition)
      : "Used - Good";

  const badge = CONDITION_COLORS[productCondition];

  const formattedPrice = (
    Number(price) || 0
  ).toLocaleString("en-PH");

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Marketplace Header */}
      <SafeAreaView
        edges={["top"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>
          Colegio De Marketplace
        </Text>

        {/* Functional Search Bar */}
        <View style={styles.searchBar}>
          <Pressable onPress={handleSearch}>
            <Ionicons
              name="search-outline"
              size={20}
              color={colors.text}
            />
          </Pressable>

          <TextInput
            style={styles.searchInput}
            placeholder="Search NSTP Uniform..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back Button */}
        <View style={styles.backHeader}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.text}
            />
          </Pressable>
        </View>

        {/* Product Image Placeholder */}
        <View style={styles.imageContainer}>
          <Ionicons
            name="image-outline"
            size={48}
            color="#C5C5C5"
          />

          <Text style={styles.imagePlaceholderText}>
            Product Image
          </Text>

          <View style={styles.pagination}>
            <View style={styles.activeDot} />
            <View style={styles.inactiveDot} />
          </View>
        </View>

        {/* Product Information */}
        <View style={styles.productInfo}>
          <Text style={styles.price}>
            ₱ {formattedPrice}
          </Text>

          <Text style={styles.title}>
            {title || "Untitled Product"}
          </Text>

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
              {productCondition}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Pressable
            style={styles.messageButton}
            onPress={() =>
              router.push("/(tabs)/messages")
            }
          >
            <Text style={styles.messageText}>
              Message
            </Text>
          </Pressable>

          <Pressable
            style={styles.moreButton}
            onPress={() =>
              console.log("More options for:", id)
            }
          >
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={colors.text}
            />
          </Pressable>
        </View>

        {/* Product Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>
            Details
          </Text>

          <Text style={styles.description}>
            {description || "No description available."}
          </Text>

          <Text style={styles.category}>
            Category: {category || "Uncategorized"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 18,
    alignItems: "center",
  },

  headerTitle: {
    color: colors.textGreenBg,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 14,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },

  scrollContent: {
    paddingBottom: 24,
  },

  backHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 20,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
  },

  imageContainer: {
    height: 220,
    backgroundColor: "#F3F3F3",
    marginHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  imagePlaceholderText: {
    fontSize: 11,
    color: "#A0A0A0",
    marginTop: 6,
  },

  pagination: {
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#333333",
  },

  inactiveDot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#BDBDBD",
  },

  productInfo: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 5,
  },

  price: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
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

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
    marginTop: 12,
  },

  messageButton: {
    flex: 1,
    height: 42,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  messageText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  moreButton: {
    width: 34,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },

  detailsSection: {
    paddingHorizontal: 16,
    marginTop: 18,
    gap: 8,
  },

  detailsTitle: {
    fontSize: 13,
    fontStyle: "italic",
    fontWeight: "500",
    color: colors.text,
  },

  description: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 19,
  },

  category: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 5,
  },
});
