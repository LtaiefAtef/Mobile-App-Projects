import { View, Text, Pressable, TouchableOpacity, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { CarLogo } from './ui/car-logo';
import { HomeIcon } from '@/components/ui/home-icon';
import { ProfileIcon } from '@/components/ui/profile-icon';
import { SettingsIcon } from '@/components/ui/settings-icon';
import { AboutIcon } from '@/components/ui/about-icon';
import { useUser } from '@/context/UserContext';
import { RefObject } from 'react';
import { User } from '@/constants/appData';
import { router } from 'expo-router';
import { logout } from '@/services/auth';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.72;

const C = {
  bg: '#F5F4F0',
  card: '#FFFFFF',
  border: '#E2E0D8',
  text: '#1A1A18',
  textMuted: '#7A7870',
  label: '#4A4844',
  addBg: '#1A1A18',
  addText: '#FFFFFF',
  removeRed: '#C0392B',
  removeBg: '#FDF0EE',
  bannerAccent: '#2C2C2A',
};
// ─── Sidebar Banner ───────────────────────────────────────────────────────────
const SidebarBanner = () => (
  <View style={styles.banner}>
    {/* subtle grid texture lines */}
    <View style={styles.bannerGridLine1} />
    <View style={styles.bannerGridLine2} />

    <CarLogo />
    <Text style={styles.bannerTitle}>AutoReport</Text>
    <Text style={styles.bannerSub}>Accident reporting made simple</Text>
  </View>
);
// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Home',     route: '/' as const,       Icon: HomeIcon },
  { label: 'Profile',  route: '/profile' as const, Icon: ProfileIcon },
  { label: 'Settings', route: '/settings' as const,  Icon: SettingsIcon },
  { label: 'About',    route: '/about' as const,   Icon: AboutIcon },
];
// ─── Sidebar ──────────────────────────────────────────────────────────────────
export function Sidebar({
  visible,
  slideAnim,
  onClose,
  onNavigate,
  currentPath,
  userInfo
}: {
  visible: boolean;
  slideAnim: Animated.Value;
  onClose: () => void;
  onNavigate: (route: string) => void;
  currentPath: string;
  userInfo : User | null
}){
  if (!visible) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.backdropInner,
            {
              opacity: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.35],
              }),
            },
          ]}
        />
      </Pressable>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-SIDEBAR_WIDTH, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* ── 1. Banner ── */}
        <SidebarBanner />

        {/* ── 2. Profile ── */}
        <View style={styles.sidebarHeader}>
          <View style={styles.sidebarAvatar}>
            <Text style={styles.sidebarAvatarText}>{userInfo ? userInfo?.firstName[0] + userInfo?.lastName[0]: "U"}</Text>
          </View>
          <View style={{ gap: 2 }}>
            <Text style={styles.sidebarName}>{userInfo ? userInfo?.firstName + " " + userInfo?.lastName: "My account"}</Text>
            <Text style={styles.sidebarSub}>Manage your profile</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── 3. Nav Links ── */}
        <View style={styles.navItems}>
          {NAV_ITEMS.map(({ label, route, Icon }) => {
            const isActive = currentPath === route;
            const iconColor = isActive ? C.text : C.label;

            return (
              <TouchableOpacity
                key={route}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => onNavigate(route)}
                activeOpacity={0.7}
              >
                {isActive && <View style={styles.activeIndicator} />}
                <Icon color={iconColor} />
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* ── 4. Log Out ── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.7}
          onPress={async()=>{
            await logout();
            onClose();
            router.replace("/(auth)/login");
          }}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};
// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Backdrop
  backdrop: { ...StyleSheet.absoluteFillObject },
  backdropInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },

  // Drawer
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: C.card,
    // no paddingTop — banner fills the top
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 16,
  },

  // Banner
  banner: {
    backgroundColor: C.addBg,
    paddingTop: Platform.OS === 'ios' ? 64 : 44,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerGridLine1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33%',
    width: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.04,
  },
  bannerGridLine2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '66%',
    width: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.04,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.addText,
    letterSpacing: 0.5,
  },
  bannerSub: {
    fontSize: 11,
    color: C.addText,
    opacity: 0.5,
    fontWeight: '400',
    letterSpacing: 0.3,
  },

  // Profile row
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  sidebarAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.addBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarAvatarText: { color: C.addText, fontSize: 18, fontWeight: '700' },
  sidebarName:       { fontSize: 15, fontWeight: '700', color: C.text },
  sidebarSub:        { fontSize: 12, color: C.textMuted, fontWeight: '400' },

  // Divider
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 20,
    marginVertical: 4,
  },

  // Nav
  navItems: { paddingVertical: 8, gap: 2 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    position: 'relative',
  },
  navItemActive:  { backgroundColor: C.bg },
  navLabel:       { fontSize: 14, fontWeight: '500', color: C.label },
  navLabelActive: { color: C.text, fontWeight: '700' },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '20%',
    bottom: '20%',
    width: 3,
    borderRadius: 2,
    backgroundColor: C.addBg,
  },

  // Log out
  logoutBtn: {
    marginTop: 'auto',
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F5C6C2',
    backgroundColor: C.removeBg,
    alignItems: 'center',
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: C.removeRed },
});