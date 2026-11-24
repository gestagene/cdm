import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Same colors as the team's theme file.
// If your project exports `colors`, delete this block and use the same
// import line that _layout.tsx uses.
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

type Message = {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
};

type Conversation = {
  id: string;
  name: string;
  course: string;
  time: string;
  unread: boolean;
  messages: Message[];
};

// Sample data. Replace with real data from your backend later.
const INITIAL: Conversation[] = [
  { id: '1', name: 'Gene Brian Gesta', course: 'BSIT', time: '2m', unread: true,
    messages: [{ id: 'a', text: 'Is the NSTP uniform still available?', fromMe: false, time: '10:40 AM' }] },
  { id: '2', name: 'Sherlyn Dablo', course: 'BSIT', time: '1h', unread: true,
    messages: [{ id: 'a', text: "I'll take it", fromMe: false, time: '9:50 AM' }] },
  { id: '3', name: 'John Earl Abanilla', course: 'BSIT', time: 'Yesterday', unread: false,
    messages: [{ id: 'a', text: '67 67 67', fromMe: false, time: '4:10 PM' }] },
  { id: '4', name: 'Henry James Vargas', course: 'BSIT', time: 'Yesterday', unread: false,
    messages: [{ id: 'a', text: 'Would you do 1,000?', fromMe: false, time: '3:20 PM' }] },
  { id: '5', name: 'Mark Joshua Jacob', course: 'BSIT', time: 'Yesterday', unread: false,
    messages: [{ id: 'a', text: 'Scammer', fromMe: false, time: '2:05 PM' }] },
  { id: '6', name: 'Joash Gabriel Mendoza', course: 'BSIT', time: 'Yesterday', unread: false,
    messages: [{ id: 'a', text: 'zzz', fromMe: false, time: '1:45 PM' }] },
  { id: '7', name: 'John Paul Labaguis', course: 'BSIT', time: 'Yesterday', unread: true,
    messages: [{ id: 'a', text: 'Hi po', fromMe: false, time: '11:30 AM' }] },
];

function nowLabel() {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  // Android back button closes the chat instead of leaving the screen
  useEffect(() => {
    if (!selectedId) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setSelectedId(null);
      return true;
    });
    return () => sub.remove();
  }, [selectedId]);

  const openChat = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false } : c))
    );
    setSelectedId(id);
  };

  const sendMessage = (id: string, text: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      text,
      fromMe: true,
      time: nowLabel(),
    };
    setConversations((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;
      const updated: Conversation = {
        ...target,
        time: 'Now',
        messages: [...target.messages, msg],
      };
      // move the updated conversation to the top
      return [updated, ...prev.filter((c) => c.id !== id)];
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (onlyUnread && !c.unread) return false;
      if (!q) return true;
      const last = c.messages[c.messages.length - 1]?.text ?? '';
      return c.name.toLowerCase().includes(q) || last.toLowerCase().includes(q);
    });
  }, [conversations, search, onlyUnread]);

  if (selected) {
    return (
      <ChatView
        conversation={selected}
        onBack={() => setSelectedId(null)}
        onSend={(text) => sendMessage(selected.id, text)}
      />
    );
  }

  const renderItem = ({ item }: { item: Conversation }) => {
    const last = item.messages[item.messages.length - 1];
    const preview = last ? (last.fromMe ? `You: ${last.text}` : last.text) : '';
    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.6}
        onPress={() => openChat(item.id)}
      >
        <View style={styles.avatar} />
        <View style={styles.rowText}>
          <Text style={[styles.name, item.unread ? styles.bold : styles.muted]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.preview, item.unread ? styles.bold : styles.muted]} numberOfLines={1}>
            {preview}
          </Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.time}>{item.time}</Text>
          {item.unread && <View style={styles.dot} />}
        </View>
        <View style={styles.thumb} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={colors.text} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Conversation"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.chip, onlyUnread && styles.chipActive]}
          onPress={() => setOnlyUnread((v) => !v)}
        >
          <Text style={[styles.chipText, onlyUnread && styles.chipTextActive]}>Unread</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={<Text style={styles.empty}>No conversations found.</Text>}
      />
    </SafeAreaView>
  );
}

function ChatView({
  conversation,
  onBack,
  onSend,
}: {
  conversation: Conversation;
  onBack: () => void;
  onSend: (text: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Chat header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textGreenBg} />
        </TouchableOpacity>
        <View style={styles.chatAvatar} />
        <View>
          <Text style={styles.chatName}>{conversation.name}</Text>
          <Text style={styles.chatCourse}>{conversation.course}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatBody}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={listRef}
          data={conversation.messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[styles.bubbleWrap, item.fromMe ? styles.right : styles.left]}>
              <View style={[styles.bubble, item.fromMe ? styles.bubbleMe : styles.bubbleThem]}>
                <Text style={item.fromMe ? styles.textMe : styles.textThem}>{item.text}</Text>
              </View>
              <Text style={styles.bubbleTime}>{item.time}</Text>
            </View>
          )}
        />

        {/* Message box (extra bottom space so the tab bar doesn't cover it) */}
        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            placeholder="Type a message"
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !draft.trim() && styles.sendBtnOff]}
            onPress={send}
            disabled={!draft.trim()}
          >
            <Ionicons name="send" size={18} color={colors.textGreenBg} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },

  // List header
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

  // Filter
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
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, letterSpacing: 1, color: colors.text },
  chipTextActive: { color: colors.textGreenBg },

  // List
  list: { flex: 1, backgroundColor: colors.background },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.surface },
  rowText: { flex: 1, marginLeft: 12, marginRight: 8 },
  name: { fontSize: 14, letterSpacing: 1, marginBottom: 4 },
  preview: { fontSize: 13, letterSpacing: 1 },
  bold: { fontWeight: '700', color: colors.text },
  muted: { color: colors.textMuted },
  meta: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginRight: 8,
    minWidth: 50,
  },
  time: { fontSize: 11, color: colors.textMuted, letterSpacing: 1 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginRight: 4,
    marginBottom: 6,
  },
  thumb: { width: 60, height: 60, borderRadius: 10, backgroundColor: colors.surface },
  separator: { height: 1, backgroundColor: colors.border },
  empty: { textAlign: 'center', marginTop: 40, color: colors.textMuted },

  // Chat
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  chatAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    marginLeft: 8,
    marginRight: 12,
  },
  chatName: { color: colors.textGreenBg, fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  chatCourse: { color: colors.textGreenBg, fontSize: 13, letterSpacing: 1 },
  chatBody: { flex: 1, backgroundColor: colors.background },
  bubbleWrap: { marginBottom: 12, maxWidth: '80%' },
  left: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  right: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: colors.primary },
  bubbleThem: { backgroundColor: colors.surface },
  textMe: { color: colors.textGreenBg, fontSize: 14 },
  textThem: { color: colors.text, fontSize: 14 },
  bubbleTime: { fontSize: 10, color: colors.textMuted, marginTop: 3 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 100, // space for the tab bar
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  composerInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: colors.surface,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnOff: { opacity: 0.4 },
});
