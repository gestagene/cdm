import { useEffect, useMemo, useState } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "../../constants/theme";
import type { Listing, Category } from "@/types/listing";
import ListedItem from "@/components/Listing";

/* ---------- Constants ---------- */

/* ---------- Mock Data ---------- */

const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "PE Uniform, Size M",
    description: "Pre-loved PE uniform in good condition.",
    price: 1071,
    condition: "Good",
    category: "Uniforms",
    status: "Available",
  },
  {
    id: "2",
    title: "Book of Building",
    description: "Secondhand educational reference book.",
    price: 350,
    condition: "Fair",
    category: "Books",
    status: "Available",
  },
  {
    id: "3",
    title: "Scientific Calculator",
    description: "Scientific calculator, almost brand new.",
    price: 6700,
    condition: "Like New",
    category: "Electronics",
    status: "Available",
  },
  {
    id: "4",
    title: "NSTP Shirt, Size XXL",
    description: "NSTP shirt in good wearable condition.",
    price: 67,
    condition: "Good",
    category: "Uniforms",
    status: "Available",
  },
];

const CATEGORIES: Category[] = [
  "All",
  "Uniforms",
  "Books",
  "Supplies",
  "Merch",
  "Electronics",
  "Arts",
  "Essentials",
  "Others",
];
/* ---------- Screen ---------- */

export default function HomeScreen() {
  const { search: searchParam } = useLocalSearchParams<{
    search?: string;
  }>();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");

  /* ---------- Receive Search From Item Screen ---------- */

  useEffect(() => {
    if (typeof searchParam === "string") {
      setSearch(searchParam);
      setCategory("All");
    }
  }, [searchParam]);

  /* ---------- Navigation ---------- */

  const navigateToItem = (item: Listing) => {
    router.push({
      pathname: "/item",
      params: {
        id: item.id,
        title: item.title,
        description: item.description,
        price: String(item.price),
        condition: item.condition,
        category: item.category,
      },
    });
  };

  /* ---------- Dynamic Filtering ---------- */

  const listings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return MOCK_LISTINGS.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;

      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  /* ---------- UI ---------- */

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView edges={["top"]} style={styles.header}>
        <Text style={styles.headerTitle}>Colegio De Marketplace</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.text} />

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

      <FlatList
        horizontal
        style={{ flexGrow: 0 }}
        data={CATEGORIES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        renderItem={({ item }) => {
          const active = item === category;

          return (
            <Pressable
              onPress={() => setCategory(item)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Listings Grid */}

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ListedItem listing={item} onClick={() => navigateToItem(item)} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No listings found.</Text>
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

  chipRow: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
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

  list: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },

  row: {
    gap: 12,
    marginBottom: 12,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: colors.textMuted,
  },
});
