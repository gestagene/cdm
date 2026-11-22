
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/theme";

/* ---------- Types ---------- */

type Category = "All" | "Uniforms" | "Books" | "School Supply" | "Food";
type Condition = "Like New" | "Used - Good" | "Used - Fair";

interface Listing {
  id: string;
  title: string;
  price: number;
  condition: Condition;
  category: Exclude<Category, "All">;
}

/* ---------- Mock Data ---------- */

const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "PE Uniform, Size M",
    price: 1071,
    condition: "Used - Good",
    category: "Uniforms",
  },
  {
    id: "2",
    title: "Book of Building",
    price: 350,
    condition: "Used - Fair",
    category: "Books",
  },
  {
    id: "3",
    title: "Scientific Calculator",
    price: 6700,
    condition: "Like New",
    category: "School Supply",
  },
  {
    id: "4",
    title: "NSTP Shirt, Size XXL",
    price: 67,
    condition: "Used - Good",
    category: "Uniforms",
  },
];

const CATEGORIES: Category[] = ["All", "Uniforms", "Books"];

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

/* ---------- Screen ---------- */

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("All");

  /* ---------- Dynamic Filtering ---------- */

  const listings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return MOCK_LISTINGS.filter((item) => {
      const matchesCategory =
        category === "All" || item.category === category;

      const matchesSearch =
        item.title.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  /* ---------- Listing Card ---------- */

  const renderItem = ({ item }: { item: Listing }) => {
    const badge = CONDITION_COLORS[item.condition];

    return (
      <Pressable
        style={styles.card}
        onPress={() => console.log("Open listing:", item.id)}
      >
        {/* Image Placeholder */}
        <View style={styles.cardImage} />

        <View style={styles.cardBody}>

          {/* Dynamic Price */}
          <Text style={styles.price}>
            ₱ {item.price.toLocaleString("en-PH")}
          </Text>

          {/* Dynamic Title */}
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>

          {/* Dynamic Condition */}
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
              {item.condition}
            </Text>
          </View>

          {/* Dynamic Category */}
          <Text style={styles.category}>
            {item.category}
          </Text>

        </View>
      </Pressable>
    );
  };

  /* ---------- UI ---------- */

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Text style={styles.headerTitle}>
          Colegio De Marketplace
        </Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.text}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search NSTP Uniform..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
      </SafeAreaView>

      {/* Category Filters */}
      <View style={styles.chipRow}>
        {CATEGORIES.map((item) => {
          const active = item === category;

          return (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.chip,
                active && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  active && styles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Listings Grid */}
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No listings found.
          </Text>
        }
      />
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /* Header */
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

  /* Category Chips */
  chipRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },

  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },

  chipTextActive: {
    color: colors.textGreenBg,
  },

  /* Listing Grid */
  list: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },

  row: {
    gap: 12,
    marginBottom: 12,
  },

  /* Listing Card */
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    overflow: "hidden",
  },

  cardImage: {
    width: "100%",
    height: 100,
    backgroundColor: colors.border,
  },

  cardBody: {
    padding: 8,
    gap: 2,
  },

  /* Dynamic Attributes */
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

  /* Empty Results */
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: colors.textMuted,
  },
});
