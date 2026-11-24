import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from "../../constants/theme";
 
export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
 
  return (
    <View style={styles.container}>
      <View style={[styles.hero, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.headline}>{'Click.\nDiscover.\nMake deals'}</Text>
        <Text style={styles.tagline}>All in one platform designed for CDMians.</Text>
      </View>
 
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.signUpButton}
          onPress={() => router.push('/signup')}
        >
          <Ionicons
            name="mail-outline"
            size={22}
            color={colors.textGreenBg}
            style={styles.signUpIcon}
          />
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
 
        <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/login')}>
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>
 
        <Text style={styles.terms}>By continuing you agree to the Terms and Privacy Policy</Text>
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  hero: { flex: 1, paddingHorizontal: 24 },
  headline: {
    color: colors.textGreenBg,
    fontSize: 44,
    lineHeight: 54,
    fontWeight: '800',
  },
  tagline: {
    color: colors.textGreenBg,
    fontSize: 22,
    lineHeight: 30,
    fontStyle: 'italic',
    fontWeight: '600',
    marginTop: 70,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  signUpButton: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  signUpIcon: { marginRight: 10 },
  signUpText: { color: colors.textGreenBg, fontSize: 16, fontWeight: '700' },
  loginLink: { alignItems: 'center', paddingVertical: 24 },
  loginText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  terms: { textAlign: 'center', fontSize: 11, color: colors.textMuted },
});
 