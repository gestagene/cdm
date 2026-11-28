
import { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';

type Screen = 'profile' | 'edit' | 'saved' | 'listed';

// sample data (UI only)
const savedItems = [
  { id: '1', title: 'Title', desc: 'Description Truncate...' },
  { id: '2', title: 'Pe Uniform, Size M', desc: '₱ 1,071 ...' },
];

const listedItems = [
  { id: '1', title: 'Title', desc: 'Description Truncate...', status: 'LISTED' },
  { id: '2', title: 'Pe Uniform, Size M', desc: '₱ 1,071 ...', status: 'SOLD' },
  { id: '3', title: 'Pe Uniform, Size M', desc: '₱ 1,071 ...', status: 'PENDING' },
];

const statusColor: Record<string, string> = {
  LISTED: '#D1D5DB',
  SOLD: 'rgba(239, 68, 68, 0.5)',
  PENDING: 'rgba(250, 204, 21, 0.5)',
};

const titles: Record<string, string> = {
  edit: 'Edit Profile',
  saved: 'Saved Items',
  listed: 'Listed Items',
};

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<Screen>('profile');

  // Android back button returns to the profile page first
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen !== 'profile') {
        setScreen('profile');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [screen]);

  const menu = [
    { label: 'My Listings', onPress: () => setScreen('listed') },
    { label: 'Saved Items', onPress: () => setScreen('saved') },
    { label: 'Notifications', onPress: () => {} },
    { label: 'Help & Feedback', onPress: () => {} },
    { label: 'Log Out', danger: true, onPress: () => router.replace('/login') },
  ];

  return (
    <View style={styles.container}>
      {/* ---------- PROFILE ---------- */}
      {screen === 'profile' && (
        <>
          <View style={[styles.profileHeader, { paddingTop: insets.top + 16 }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>GG</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>Gene Brian Gesta</Text>
              <Text style={styles.sub}>BSIT</Text>
              <Text style={styles.sub}>Verified</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.editButton}
            onPress={() => setScreen('edit')}
          >
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>

          {menu.map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.7}
              style={styles.menuRow}
              onPress={item.onPress}
            >
              <Text style={[styles.menuText, item.danger && { color: colors.error }]}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text} />
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* ---------- GREEN HEADER FOR EDIT / SAVED / LISTED ---------- */}
      {screen !== 'profile' && (
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            onPress={() => setScreen('profile')}
            hitSlop={10}
            style={styles.back}
          >
            <Ionicons name="chevron-back" size={26} color={colors.textGreenBg} />
          </TouchableOpacity>
          <Text style={styles.headerText}>{titles[screen]}</Text>
        </View>
      )}

      {/* ---------- EDIT PROFILE ---------- */}
      {screen === 'edit' && (
        <>
          <Text style={styles.section}>General</Text>

          <View style={styles.editRow}>
            <Text style={styles.label}>Username</Text>
            <Text style={[styles.value, { marginRight: 26 }]}>GestaGeneBrian</Text>
          </View>

          <TouchableOpacity activeOpacity={0.7} style={styles.editRow}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.right}>
              <Text style={styles.value}>+639920244504</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.text}
                style={styles.chevron}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} style={styles.editRow}>
            <Text style={styles.label}>Password</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text} />
          </TouchableOpacity>

          <Text style={styles.section}>Verification</Text>

          {/* ---------- STUDENT ID VERIFICATION ---------- */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.editRow}
            onPress={() => router.push('/verification')}
            accessibilityRole="button"
            accessibilityLabel="Add Student ID"
          >
            <Text style={styles.label}>Student ID</Text>

            <View style={[styles.pill, { backgroundColor: colors.border }]}>
              <Text style={[styles.pillText, { color: colors.textMuted }]}>
                ADD
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.editRow}>
            <Text style={styles.label}>Institutional Email</Text>
            <View style={[styles.pill, { backgroundColor: 'rgba(16, 185, 129, 0.3)' }]}>
              <Text style={[styles.pillText, { color: colors.primary }]}>VERIFIED</Text>
            </View>
          </View>
        </>
      )}

      {/* ---------- SAVED ITEMS ---------- */}
      {screen === 'saved' &&
        savedItems.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.textWrap}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.itemDesc} numberOfLines={1}>
                {item.desc}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.smallPill, { backgroundColor: colors.border }]}
            >
              <Text style={[styles.pillText, { color: colors.textMuted }]}>View</Text>
            </TouchableOpacity>
          </View>
        ))}

      {/* ---------- LISTED ITEMS ---------- */}
      {screen === 'listed' && (
        <>
          <TouchableOpacity activeOpacity={0.8} style={styles.sort}>
            <Text style={styles.sortText}>SORT BY</Text>
          </TouchableOpacity>

          {listedItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.textWrap}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.itemDesc} numberOfLines={1}>
                  {item.desc}
                </Text>
              </View>
              <View style={[styles.smallPill, { backgroundColor: statusColor[item.status] }]}>
                <Text style={[styles.pillText, { color: colors.text }]}>{item.status}</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // profile
  profileHeader: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontSize: 34, fontWeight: '800' },
  info: { marginLeft: 16 },
  name: { color: colors.textGreenBg, fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  sub: {
    color: colors.textGreenBg,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  editButton: {
    height: 44,
    margin: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: { color: colors.primary, fontSize: 16, letterSpacing: 1.5 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuText: { fontSize: 15, color: colors.text, letterSpacing: 1 },

  // green header (edit / saved / listed)
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  back: { marginRight: 6 },
  headerText: { color: colors.textGreenBg, fontSize: 24, fontWeight: '800', letterSpacing: 2 },

  // edit profile
  section: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.text,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 46,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: { fontSize: 12, color: colors.text, letterSpacing: 1 },
  value: { fontSize: 11, color: colors.text, letterSpacing: 0.5 },
  right: { flexDirection: 'row', alignItems: 'center' },
  chevron: { marginLeft: 8 },
  pill: {
    height: 24,
    minWidth: 86,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: { fontSize: 11, letterSpacing: 1 },

  // saved + listed rows
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 68,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  textWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  itemTitle: { fontSize: 14, color: colors.textMuted, marginRight: 10 },
  itemDesc: { flex: 1, fontSize: 14, color: colors.textMuted },
  smallPill: {
    width: 84,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sort: {
    alignSelf: 'flex-start',
    height: 22,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 28,
    paddingHorizontal: 14,
    borderRadius: 11,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortText: { fontSize: 11, color: colors.text, letterSpacing: 1 },
});
