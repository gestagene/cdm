import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

const CATEGORIES = ["Uniforms", "Books", "Merch", "Others"];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];

export default function Sell() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Uniforms");
  const [condition, setCondition] = useState("Good");
  const [description, setDescription] = useState("");

  const handlePost = () => {
    console.log({ title, price, category, condition, description });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Sell an Item</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Photos (0/3, first photo is the cover)</Text>
        <View style={styles.photoRow}>
          <View style={styles.photoBox} />
          <View style={styles.photoBox} />
          <View style={styles.photoBox} />
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. NSTP Uniform, size M"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input}
          placeholder="₱"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, category === item && styles.chipActive]}
              onPress={() => setCategory(item)}
            >
              <Text style={category === item ? styles.chipTextActive : styles.chipText}>
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
              onPress={() => setCondition(item)}
            >
              <Text style={condition === item ? styles.chipTextActive : styles.chipText}>
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

const GREEN = "#065F2C";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { backgroundColor: GREEN, paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16 },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  form: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: "600", marginTop: 14, marginBottom: 6, color: "#333" },
  photoRow: { flexDirection: "row", gap: 10 },
  photoBox: { width: 80, height: 80, backgroundColor: "#E5E5E5", borderRadius: 8 },
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
  chipActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { color: "#333" },
  chipTextActive: { color: "#fff" },
  postButton: {
    backgroundColor: GREEN,
    padding: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 24,
  },
  postButtonText: { color: "#fff", fontWeight: "bold" },
});