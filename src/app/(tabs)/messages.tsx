import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Same colors as your team's theme file.
// If your project already exports `colors`, delete this block and use the
// same import line that _layout.tsx uses, e.g.  import { colors } from '...';
const colors = {
  primary: '#026636',
  background: '#FFFFFF',
  surface: '#F3F4F6',
  text: '#111827',
  textGreenBg: '#FFFFFF',
  textMuted: '#737373',
  border: '#EBEBEB',
  success: '#10B981',
  error: '#EF4444',
};

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: boolean;
};

const CONVERSATIONS: Conversation[] = [
  { id: '1', name: 'Gene Brian Gesta', lastMessage: 'Is the NSTP uniform still available?', time: '2m', unread: true },
  { id: '2', name: 'Sherlyn Dablo', lastMessage: "I'll take it", time: '1h', unread: true },
  { id: '3', name: 'John Earl Abanilla', lastMessage: '67 67 67', time: 'Yesterday', unread: false },
  { id: '4', name: 'Henry James Vargas', lastMessage: 'Would you do 1,000?', time: 'Yesterday', unread: false },
  { id: '5', name: 'Mark Joshua Jacob', lastMessage: 'Scammer', time: 'Yesterday', unread: false },
  { id: '6', name: 'Joash Gabriel Mendoza', lastMessage: 'zzz', time: 'Yesterday', unread: false },
  { id: '7', name: 'John Paul Labaguis', lastMessage: 'Hi po', time: 'Yesterday', unread: true },
];

export default function MessagesScreen() {
  const [search, setSearch] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CONVERSATIONS.filter((c) => {
      if (onlyUnread && !c.unread) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
      );
    });
  }, [search, onlyUnread]);

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.6}
      onPress={() => {
        // TODO: open the chat screen for this conversation
      }}
    >
      <View style={styles.avatar} />

      <View style={styles.rowText}>
        <Text
          style={[styles.name, item.unread ? styles.bold : styles.muted]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          style={[styles.preview, item.unread ? styles.bold : styles.muted]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.time}>{item.time}</Text>
        {item.unread && <View style={styles.dot} />}
      </View>

      <View style={styles.thumb} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header + search */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.searchBox}>
         
          <TextInput
            style={styles.searchInput}
            placeholder="Search Conversation"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Unread filter */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.chip, onlyUnread && styles.chipActive]}
          onPress={() => setOnlyUnread((v) => !v)}
        >
          <Text style={[styles.chipText, onlyUnread && styles.chipTextActive]}>
            Unread
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conversation list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        style={styles.list}
        // extra space so the tab bar doesn't cover the last row
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No conversations found.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.primary, // colors the status bar area
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
  },
  headerTitle: {
    color: colors.textGreenBg,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    letterSpacing: 1,
    color: colors.text,
  },

  // Unread filter
  filterRow: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    letterSpacing: 1,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.textGreenBg,
  },

  // List
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
  },
  rowText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 4,
  },
  preview: {
    fontSize: 13,
    letterSpacing: 1,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  muted: {
    color: colors.textMuted,
  },
  meta: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginRight: 8,
    minWidth: 50,
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginRight: 4,
    marginBottom: 6,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textMuted,
  },
});