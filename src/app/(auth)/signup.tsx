import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';
 
export default function SignUp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirm, setHideConfirm] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const onLogin = () => {
  setIsLoading(true);
  // fake delay for now. Later this is where the database call goes.
  setTimeout(() => {
    setIsLoading(false);
    router.replace('/(tabs)');
  }, 1500);
};
 
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerText}>Getting Started</Text>
      </View>
 
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Something good starts here.</Text>
        <Text style={styles.subtitle}>Click, Discover, Make Deals!</Text>
 
        <View style={styles.card}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
 
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              secureTextEntry={hidePassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eye}
              onPress={() => setHidePassword((h) => !h)}
              disabled={isLoading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={hidePassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                 color={isLoading ? colors.border : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
 
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              secureTextEntry={hideConfirm}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eye}
              onPress={() => setHideConfirm((h) => !h)}
              disabled={isLoading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={hideConfirm ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={isLoading ? colors.border : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
 
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>
 
          <Text style={styles.note}>
            Note: Your phone number can also be used to reset your password.
          </Text>
 
          <TouchableOpacity
              activeOpacity={0.85}
              style={[
              styles.button,
             { backgroundColor: isLoading ? 'rgba(2, 102, 54, 0.5)': colors.primary },
              ]}
            onPress={onLogin}
            disabled={isLoading}
          >
           {isLoading ? (
            <ActivityIndicator color={colors.textGreenBg} />
              ) : (
            <Text style={styles.buttonText}>Submit</Text>
  )}
          </TouchableOpacity>
 
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => router.replace({ pathname: '/login', params: { from: 'link' } })}
            disabled={isLoading}
>
            <Text style={styles.link}>Log in Here</Text>
           </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
 
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerText: {
    color: colors.textGreenBg,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  body: { padding: 24 },
  title: { fontSize: 22, fontWeight: '800', color: colors.primary },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4, marginBottom: 24 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
  },
  inputWrapper: { justifyContent: 'center', marginBottom: 16 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 13,
    color: colors.text,
  },
  inputDisabled: { backgroundColor: colors.surface, opacity: 0.6 },

  eye: { position: 'absolute', right: 16 },
  note: {
    fontSize: 10,
    fontStyle: 'italic',
    color: colors.textMuted,
    marginTop: -8,
    marginBottom: 24,
  },
  button: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
  },
  buttonText: { color: colors.textGreenBg, fontSize: 18, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  footerText: { fontSize: 14, color: colors.text },
  link: { fontSize: 13, color: colors.primary, fontWeight: '600' },
});
 