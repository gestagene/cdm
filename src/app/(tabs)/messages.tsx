import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
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
// If you want to use the team's file instead, delete this block and add:
//   import { colors } from '@/constants/theme';
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

// =====================================================================
// 1. DATA MODEL
// =====================================================================

// The name used for messages that YOU send.
// Later, replace this with the logged-in user's name.
const CURRENT_USER = 'You';

type Message = {
  id: string;
  sender: string;   // Sender
  message: string;  // Message
  date: string;     // Date (ISO string)
  unread: boolean;  // Unread: true / false
};

// The items this app focuses on
const CATEGORIES = ['PE Shirt', 'NSTP Shirt', 'School Pants', 'PE Pants'] as const;
type Category = (typeof CATEGORIES)[number];

type Product = {
  category: Category; // used by the category filter
  title: string;      // "PE Shirt, Size M"
  price: number;      // 1071
  condition: string;  // "Used - Good"
  image?: string;     // optional image URL
};

type Conversation = {
  id: string;
  name: string;       // the person you are chatting with
  course: string;     // "BSIT"
  product?: Product;  // the item they are asking about / ordering
  messages: Message[];
};

// =====================================================================
// 2. HELPERS
// =====================================================================

const lastMessage = (c: Conversation): Message | undefined =>
  c.messages[c.messages.length - 1];

// A conversation is "unread" if the OTHER person sent a message you haven't read
const hasUnread = (c: Conversation): boolean =>
  c.messages.some((m) => m.unread && m.sender !== CURRENT_USER);

function formatPrice(n: number): string {
  return '₱' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// "10:45 AM"
function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// "Today" / "Yesterday" / "Nov 22, 2026"  (date divider inside the chat)
function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, now)) return 'Today';
  if (isSameDay(d, yesterday)) return 'Yesterday';
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// "2m" / "1h" / "Yesterday"  (time shown in the conversation list)
function listTime(iso: string): string {
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return 'Now';
  if (diffMin < 60) return `${diffMin}m`;
  if (isSameDay(d, new Date())) return `${Math.floor(diffMin / 60)}h`;
  return dayLabel(iso);
}

// =====================================================================
// 3. SAMPLE DATA (replace with your backend later)
// =====================================================================

const minutesAgo = (n: number) => new Date(Date.now() - n * 60000).toISOString();

const yesterdayAt = (h: number, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Gene Brian Gesta',
    course: 'BSIT',
    product: { category: 'NSTP Shirt', title: 'NSTP Shirt, Size L', price: 250, condition: 'Used - Good' },
    messages: [
      { id: 'a', sender: 'Gene Brian Gesta', message: 'Is the NSTP shirt still available?', date: minutesAgo(2), unread: true },
    ],
  },
  {
    id: '2',
    name: 'Sherlyn Dablo',
    course: 'BSIT',
    product: { category: 'PE Pants', title: 'PE Pants, Size M', price: 300, condition: 'Like New' },
    messages: [
      { id: 'a', sender: 'Sherlyn Dablo', message: "I'll take it", date: minutesAgo(60), unread: true },
    ],
  },
  {
    id: '3',
    name: 'John Earl Abanilla',
    course: 'BSIT',
    product: { category: 'School Pants', title: 'School Pants, Size 32', price: 400, condition: 'Used - Fair' },
    messages: [
      { id: 'a', sender: 'John Earl Abanilla', message: 'Is the waist really size 32?', date: yesterdayAt(20, 10), unread: false },
    ],
  },
  {
    id: '4',
    name: 'Henry James Vargas',
    course: 'BSIT',
    product: { category: 'PE Shirt', title: 'PE Shirt, Size L', price: 350, condition: 'Used - Good' },
    messages: [
      { id: 'a', sender: 'Henry James Vargas', message: 'Would you do 250?', date: yesterdayAt(19, 20), unread: false },
    ],
  },
  {
    id: '5',
    name: 'Mark Joshua Jacob',
    course: 'BSIT',
    product: { category: 'PE Shirt', title: 'PE Shirt, Size M', price: 350, condition: 'Used - Good' },
    messages: [
      { id: 'a', sender: CURRENT_USER, message: 'Boss last price?', date: yesterdayAt(18, 0), unread: false },
      { id: 'b', sender: 'Mark Joshua Jacob', message: '300 na lang po', date: yesterdayAt(18, 5), unread: false },
    ],
  },
  {
    id: '6',
    name: 'Joash Gabriel Mendoza',
    course: 'BSIT',
    product: { category: 'NSTP Shirt', title: 'NSTP Shirt, Size S', price: 200, condition: 'Used - Good' },
    messages: [
      { id: 'a', sender: 'Joash Gabriel Mendoza', message: 'Pwede po ba meet up bukas?', date: yesterdayAt(17, 45), unread: false },
    ],
  },
  {
    id: '7',
    name: 'John Paul Labaguis',
    course: 'BSIT',
    product: { category: 'School Pants', title: 'School Pants, Size 30', price: 380, condition: 'Like New' },
    messages: [
      { id: 'a', sender: 'John Paul Labaguis', message: 'Hi po', date: yesterdayAt(16, 30), unread: true },
    ],
  },
  {
    id: '8',
    name: 'Angelo Ramirez',
    course: 'BSIT',
    product: { category: 'PE Pants', title: 'PE Pants, Size L', price: 320, condition: 'Used - Good' },
    messages: [
      { id: 'a', sender: 'Angelo Ramirez', message: 'Available pa po ba ang PE pants?', date: yesterdayAt(15, 10), unread: false },
    ],
  },
];

// =====================================================================
// 4. COMPONENTS
// =====================================================================

// ---- MessageBubble: one chat message --------------------------------
// Usage: <MessageBubble message={item} />
function MessageBubble({ message }: { message: Message }) {
  const isMine = message.sender === CURRENT_USER;
  return (
    <View style={[bubble.wrap, isMine ? bubble.right : bubble.left]}>
      <View style={[bubble.box, isMine ? bubble.boxMine : bubble.boxTheirs]}>
        <Text style={[bubble.text, isMine ? bubble.textMine : bubble.textTheirs]}>
          {message.message}
        </Text>
      </View>
      <Text style={bubble.time}>{formatTime(message.date)}</Text>
    </View>
  );
}

// ---- ProductCard: the item they are ordering ------------------------
// Usage: <ProductCard product={conversation.product} />
function ProductCard({ product }: { product: Product }) {
  return (
    <View style={card.card}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={card.image} />
      ) : (
        <View style={[card.image, card.imagePlaceholder]} />
      )}
      <View style={card.info}>
        <Text style={card.price}>{formatPrice(product.price)}</Text>
        <Text style={card.title} numberOfLines={1}>
          {product.title}
        </Text>
        <View style={card.badge}>
          <Text style={card.badgeText}>{product.condition}</Text>
        </View>
      </View>
    </View>
  );
}

// ---- ConversationItem: one row in the list --------------------------
// Usage: <ConversationItem conversation={item} onPress={() => open(item.id)} />
function ConversationItem({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) {
  const last = lastMessage(conversation);
  const unread = hasUnread(conversation);
  const preview = last
    ? last.sender === CURRENT_USER
      ? `You: ${last.message}`
      : last.message
    : '';

  return (
    <TouchableOpacity style={item.row} activeOpacity={0.6} onPress={onPress}>
      <View style={item.avatar} />
      <View style={item.text}>
        <Text style={[item.name, unread ? item.bold : item.muted]} numberOfLines={1}>
          {conversation.name}
        </Text>
        <Text style={[item.preview, unread ? item.bold : item.muted]} numberOfLines={1}>
          {preview}
        </Text>
      </View>
      <View style={item.meta}>
        <Text style={item.time}>{last ? listTime(last.date) : ''}</Text>
        {unread && <View style={item.dot} />}
      </View>
      {conversation.product?.image ? (
        <Image source={{ uri: conversation.product.image }} style={item.thumb} />
      ) : (
        <View style={item.thumb} />
      )}
    </TouchableOpacity>
  );
}

// =====================================================================
// 5. SCREEN (this is what the tab shows)
// =====================================================================

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>(SAMPLE_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);

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

  // Open a chat and mark its messages as read
  const openChat = (id: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id !== id
          ? c
          : { ...c, messages: c.messages.map((m) => ({ ...m, unread: false })) }
      )
    );
    setSelectedId(id);
  };

  // Add a new message that YOU sent
  const sendMessage = (id: string, text: string) => {
    const newMessage: Message = {
      id: `${Date.now()}`,
      sender: CURRENT_USER,
      message: text,
      date: new Date().toISOString(),
      unread: false,
    };
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, messages: [...c.messages, newMessage] } : c))
    );
  };

  // Search + Unread filter, newest conversation first
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const time = (c: Conversation) => new Date(lastMessage(c)?.date ?? 0).getTime();
    return conversations
      .filter((c) => {
        if (onlyUnread && !hasUnread(c)) return false;
        if (category && c.product?.category !== category) return false;
        if (!q) return true;
        const last = lastMessage(c)?.message ?? '';
        const item = c.product?.title ?? '';
        return (
          c.name.toLowerCase().includes(q) ||
          last.toLowerCase().includes(q) ||
          item.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => time(b) - time(a));
  }, [conversations, search, onlyUnread, category]);

  if (selected) {
    return (
      <ChatScreen
        conversation={selected}
        onClose={() => setSelectedId(null)}
        onSend={(text) => sendMessage(selected.id, text)}
      />
    );
  }

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

      {/* Filters: Unread + the 4 item categories */}
      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[styles.chip, onlyUnread && styles.chipActive]}
            onPress={() => setOnlyUnread((v) => !v)}
          >
            <Text style={[styles.chipText, onlyUnread && styles.chipTextActive]}>Unread</Text>
          </TouchableOpacity>

          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(category === cat ? null : cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(c) => c.id}
        renderItem={({ item: c }) => (
          <ConversationItem conversation={c} onPress={() => openChat(c.id)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={<Text style={styles.empty}>No conversations found.</Text>}
      />
    </SafeAreaView>
  );
}

// ---- ChatScreen: opens when you tap a conversation ------------------
type ChatItem =
  | { type: 'date'; id: string; label: string }
  | { type: 'message'; id: string; message: Message };

function ChatScreen({
  conversation,
  onClose,
  onSend,
}: {
  conversation: Conversation;
  onClose: () => void;
  onSend: (text: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatItem>>(null);

  // Put a "Today" / "Yesterday" divider whenever the day changes
  const items = useMemo<ChatItem[]>(() => {
    const out: ChatItem[] = [];
    let lastDay = '';
    conversation.messages.forEach((m) => {
      const label = dayLabel(m.date);
      if (label !== lastDay) {
        out.push({ type: 'date', id: `date-${m.id}`, label });
        lastDay = label;
      }
      out.push({ type: 'message', id: m.id, message: m });
    });
    return out;
  }, [conversation.messages]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header: avatar, name, course, close button */}
      <View style={chat.header}>
        <View style={chat.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={chat.name} numberOfLines={1}>
            {conversation.name}
          </Text>
          <Text style={chat.course}>{conversation.course}</Text>
        </View>
        <TouchableOpacity style={chat.closeBtn} onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* What they are ordering */}
      {conversation.product && <ProductCard product={conversation.product} />}

      <KeyboardAvoidingView
        style={chat.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item: i }) =>
            i.type === 'date' ? (
              <Text style={chat.dateLabel}>{i.label}</Text>
            ) : (
              <MessageBubble message={i.message} />
            )
          }
        />

        <View style={chat.composer}>
          <TextInput
            style={chat.input}
            placeholder="Type a message"
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <TouchableOpacity
            style={[chat.sendBtn, !draft.trim() && chat.sendBtnOff]}
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

// =====================================================================
// 6. STYLES
// =====================================================================

// Screen + list
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
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
  filterWrap: { backgroundColor: colors.background },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 5,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, letterSpacing: 1, color: colors.text },
  chipTextActive: { color: colors.textGreenBg },
  list: { flex: 1, backgroundColor: colors.background },
  separator: { height: 1, backgroundColor: colors.border },
  empty: { textAlign: 'center', marginTop: 40, color: colors.textMuted },
});

// MessageBubble
const bubble = StyleSheet.create({
  wrap: { maxWidth: '80%', marginBottom: 12 },
  left: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  right: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  box: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
  boxMine: { backgroundColor: colors.primary },
  boxTheirs: { backgroundColor: '#E5E7EB' },
  text: { fontSize: 13, letterSpacing: 0.5 },
  textMine: { color: colors.textGreenBg },
  textTheirs: { color: colors.text },
  time: { fontSize: 10, color: colors.textMuted, marginTop: 3, marginHorizontal: 4 },
});

// ProductCard
const card = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  image: { width: 64, height: 64, borderRadius: 8 },
  imagePlaceholder: { backgroundColor: '#B5B5B5' },
  info: { flex: 1, marginLeft: 12 },
  price: { fontSize: 16, fontWeight: '700', color: colors.text },
  title: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 2 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DDF5E6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginTop: 6,
  },
  badgeText: { fontSize: 11, color: colors.primary, letterSpacing: 0.5 },
});

// ConversationItem
const item = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.surface },
  text: { flex: 1, marginLeft: 12, marginRight: 8 },
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
});

// ChatScreen
const chat = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.background,
    marginRight: 12,
  },
  name: { color: colors.textGreenBg, fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  course: {
    color: colors.textGreenBg,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  body: { flex: 1, backgroundColor: colors.background },
  dateLabel: {
    alignSelf: 'center',
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 100, // space so the tab bar doesn't cover the message box
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
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