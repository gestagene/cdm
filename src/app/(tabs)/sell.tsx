import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/theme";

export type Category =
  | "All"
  | "Uniforms"
  | "Books"
  | "Supplies"
  | "Merch"
  | "Electronics"
  | "Arts"
  | "Essentials"
  | "Others";

const CATEGORIES: Exclude<Category, "All">[] = [
  "Uniforms",
  "Books",
  "Supplies",
  "Merch",
  "Electronics",
  "Arts",
  "Essentials",
  "Others",
];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];
const MAX_PHOTOS = 5;

export default function Sell() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const pickPhoto = async () => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos([...photos, ...uris].slice(0, MAX_PHOTOS));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };
  const handlePriceChange = (text: string) => {
    // keep only digits and one dot, max 2 decimals
    const [whole, ...rest] = text.replace(/[^0-9.]/g, "").split(".");
    const cleaned = rest.length
      ? `${whole}.${rest.join("").slice(0, 2)}`
      : whole;
    setPrice(cleaned);
  };

  const formatPrice = () => {
    const value = parseFloat(price);
    if (!isNaN(value)) setPrice(value.toFixed(2));
  };

  const handlePost = () => {
    if (!title || !price || !category || !condition || !description) {
      alert("Please fill in all fields");
      return;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>New Listing</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>
          Upload Photos ({photos.length}/{MAX_PHOTOS})
        </Text>
        <View style={styles.photoGrid}>
          {photos.map((uri, i) => (
            <View key={uri} style={styles.photoCard}>
              <Image source={{ uri }} style={styles.photoImage} />
              <TouchableOpacity
                style={styles.removeBadge}
                onPress={() => removePhoto(i)}
              >
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}

          {photos.length < MAX_PHOTOS && (
            <TouchableOpacity
              style={styles.photoCard}
              onPress={pickPhoto}
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={28} color="#888" />
              <View style={styles.addBadge}>
                <Ionicons name="add" size={18} color="#000" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. NSTP Uniform, size M"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Price</Text>
        <View style={styles.priceBox}>
          <Text style={styles.pesoSign}>₱</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={price}
            onChangeText={handlePriceChange}
            onBlur={formatPrice}
          />
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, category === item && styles.chipActive]}
              onPress={() => setCategory(category === item ? "" : item)}
            >
              <Text
                style={
                  category === item ? styles.chipTextActive : styles.chipText
                }
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Condition</Text>
        <View style={styles.chipRow}>
          {CONDITIONS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, condition === item && styles.chipActive]}
              onPress={() => setCondition(condition === item ? "" : item)}
            >
              <Text
                style={
                  condition === item ? styles.chipTextActive : styles.chipText
                }
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Size, usage, flaws..."
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postButtonText}>Post Listing</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerText: { color: colors.textGreenBg, fontSize: 18, fontWeight: "bold" },
  form: { padding: 16, paddingBottom: 140 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 14,
    marginBottom: 6,
    color: colors.text,
  },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  photoCard: {
    width: 100,
    height: 100,
    backgroundColor: "#F3F3F3",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoImage: { width: "100%", height: "100%" },
  addBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  removeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  textArea: { height: 110, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: "#333" },
  chipTextActive: { color: "#fff" },
  postButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 24,
  },
  postButtonText: { color: "#fff", fontWeight: "bold" },
  priceBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  pesoSign: { fontSize: 16, fontWeight: "600", color: "#333", marginRight: 6 },
  priceInput: { flex: 1, paddingVertical: 10, fontSize: 14 },
});
