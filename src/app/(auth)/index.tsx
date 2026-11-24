import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';
 

const logo = require('../../../assets/logo.png');
 
export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
 
  const logoFade = useRef(new Animated.Value(0)).current; // logo appears
  const grow = useRef(new Animated.Value(0)).current; // green circle fills the screen
  const logoUp = useRef(new Animated.Value(0)).current; // logo moves away
  const textFade = useRef(new Animated.Value(0)).current;
  const textUp = useRef(new Animated.Value(80)).current;
  const sheetUp = useRef(new Animated.Value(400)).current;
 
  useEffect(() => {
    Animated.sequence([
      // 1) white screen, logo fades in
      Animated.timing(logoFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.delay(900),
      // 2) the logo's green grows from the logo and fills the whole background
      Animated.timing(grow, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(500),
      // 3) logo moves up, text + buttons slide in up
      Animated.parallel([
        Animated.timing(logoUp, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(textFade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(textUp, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sheetUp, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);
 
  const logoSize = 150;
  // how much the circle must grow to reach the farthest corner of the screen
  const maxScale = (Math.hypot(width, height) / logoSize) * 1.05;
 
  return (
    <View style={styles.container}>
      {/* green circle: starts as big as the logo, then grows over the whole screen */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: logoSize,
          height: logoSize,
          borderRadius: logoSize / 2,
          top: height / 2 - logoSize / 2,
          left: width / 2 - logoSize / 2,
          backgroundColor: colors.primary,
          opacity: logoFade,
          transform: [
            { scale: grow.interpolate({ inputRange: [0, 1], outputRange: [1, maxScale] }) },
          ],
        }}
      />
 
      {/* same logo the whole time */}
      <Animated.Image
        source={logo}
        resizeMode="contain"
        style={{
          position: 'absolute',
          width: logoSize,
          height: logoSize,
          top: height / 2 - logoSize / 2,
          left: width / 2 - logoSize / 2,
          opacity: Animated.multiply(
            logoFade,
            logoUp.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
          ),
          transform: [
            { translateY: logoUp.interpolate({ inputRange: [0, 1], outputRange: [0, -120] }) },
            { scale: logoUp.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] }) },
          ],
        }}
      />
 
      <Animated.View
        style={[
          styles.hero,
          { paddingTop: insets.top + 60, opacity: textFade, transform: [{ translateY: textUp }] },
        ]}
      >
        <Text style={styles.headline}>{'Click.\nDiscover.\nMake deals'}</Text>
        <Text style={styles.tagline}>All in one platform designed for CDMians.</Text>
      </Animated.View>
 
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + 16, transform: [{ translateY: sheetUp }] },
        ]}
      >
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
      </Animated.View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
 