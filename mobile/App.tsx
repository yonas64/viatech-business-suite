import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthScreen } from './src/AuthScreen';
import { apiRequest, clearToken, loadToken, setUnauthorizedHandler } from './src/api';
import { CategoriesScreen } from './src/CategoriesScreen';
import { DashboardScreen } from './src/DashboardScreen';
import { ExpensesScreen, FinanceScreen } from './src/FinanceScreens';
import { InventoryScreen } from './src/InventoryScreen';
import { ProductsScreen } from './src/ProductsScreen';
import { ReportsScreen } from './src/ReportsScreen';
import { SalesScreen } from './src/SalesScreen';
import { TeamScreen } from './src/TeamScreen';
import type { User } from './src/types';
import { Button, Card, Page, Row, ScrollVisibilityContext, colors } from './src/ui';

const screens = ['Home', 'Products', 'Stock', 'Sales', 'Categories', 'Finance', 'Expenses', 'Reports', 'Team', 'Profile'];
const bottomTabs = [
  { label: 'Home', icon: '⌂' },
  { label: 'Sales', icon: '↗' },
  { label: 'Products', icon: '▦' },
  { label: 'Profile', icon: '●' },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState('Home');
  const [history, setHistory] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bottomNavVisible, setBottomNavVisible] = useState(true);
  const [starting, setStarting] = useState(true);
  const [startupError, setStartupError] = useState('');
  const [retry, setRetry] = useState(0);

  const signOut = useCallback(() => {
    setUser(null);
    setScreen('Home');
    setHistory([]);
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(signOut);
    let active = true;
    async function start() {
      setStartupError('');
      let storedToken: string | null = null;
      try {
        storedToken = await loadToken();
        if (storedToken) {
          const currentUser = await apiRequest<User>('/auth/me');
          if (active) setUser(currentUser);
        }
      } catch (cause) {
        if (active) {
          if (!storedToken) {
            setStartupError(cause instanceof Error ? cause.message : 'Could not restore your session.');
          } else {
            try {
              if (await loadToken()) setStartupError(cause instanceof Error ? cause.message : 'Could not restore your session.');
            } catch (storageError) {
              setStartupError(storageError instanceof Error ? storageError.message : 'Could not restore your session.');
            }
          }
        }
      } finally {
        if (active) setStarting(false);
      }
    }
    void start();
    return () => { active = false; };
  }, [retry, signOut]);

  const goBack = useCallback(() => {
    setScreen(history.length ? history[history.length - 1] : 'Home');
    setHistory((previous) => previous.slice(0, -1));
    setBottomNavVisible(true);
  }, [history]);

  const onPageScroll = useCallback((direction: number) => {
    if (direction === 0) setBottomNavVisible(true);
    else setBottomNavVisible(direction < 0);
  }, []);

  useEffect(() => {
    if (!user) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (menuOpen) {
        setMenuOpen(false);
        return true;
      }
      if (screen !== 'Home') {
        goBack();
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [goBack, menuOpen, screen, user]);

  async function logout() {
    try { await clearToken(); }
    catch (cause) {
      setStartupError(cause instanceof Error ? cause.message : 'Could not clear your saved session.');
      return;
    }
    signOut();
  }

  function confirmLogout() {
    Alert.alert('Sign out?', 'You will need to sign in again to access your workspace.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void logout() },
    ]);
  }

  if (starting) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.blue} />
        <Text style={styles.helper}>Connecting to your workspace…</Text>
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }
  if (!user) {
    if (startupError) {
      return (
        <SafeAreaView style={styles.center}>
          <Text style={styles.title}>Couldn’t restore your session</Text>
          <Text style={styles.helper}>{startupError}</Text>
          <Button title="Try again" onPress={() => { setStarting(true); setRetry((value) => value + 1); }} />
          <Button title="Continue to sign in" secondary onPress={() => {
            void clearToken()
              .then(() => setStartupError(''))
              .catch((cause: Error) => setStartupError(cause.message));
          }} />
          <StatusBar style="dark" />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.app}>
        <AuthScreen onLogin={setUser} />
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  const allowedScreens = screens.filter((name) => name !== 'Team' || user.role === 'admin');
  const activeScreen = allowedScreens.includes(screen) ? screen : 'Home';
  const navigate = (target: string) => {
    const normalized = target === 'Inventory' ? 'Stock' : target;
    if (!allowedScreens.includes(normalized)) return;
    setMenuOpen(false);
    setBottomNavVisible(true);
    if (normalized !== screen) {
      setHistory((previous) => [...previous, screen]);
      setScreen(normalized);
    }
  };

  function navigateTab(target: string) {
    if (!allowedScreens.includes(target)) return;
    setMenuOpen(false);
    setScreen(target);
    setHistory([]);
    setBottomNavVisible(true);
  }

  return (
    <SafeAreaView style={styles.app} edges={['top', 'bottom']}>
      <View style={styles.navigation}>
        <View style={styles.navHeader}>
          {activeScreen !== 'Home' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={goBack}
              style={styles.iconButton}
            >
              <Text style={styles.iconText}>‹</Text>
            </Pressable>
          ) : null}
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>Viatech</Text>
            <Text style={styles.account}>{activeScreen} · {user.name}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open navigation menu"
            accessibilityState={{ expanded: menuOpen }}
            onPress={() => setMenuOpen(true)}
            style={styles.menuButton}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.content}>
        <ScrollVisibilityContext.Provider value={onPageScroll}>
          {activeScreen === 'Home' ? <DashboardScreen key={activeScreen} user={user} onNavigate={navigate} /> : null}
          {activeScreen === 'Products' ? <ProductsScreen key={activeScreen} isAdmin={user.role === 'admin'} /> : null}
          {activeScreen === 'Stock' ? <InventoryScreen key={activeScreen} isAdmin={user.role === 'admin'} /> : null}
          {activeScreen === 'Sales' ? <SalesScreen key={activeScreen} /> : null}
          {activeScreen === 'Categories' ? <CategoriesScreen key={activeScreen} isAdmin={user.role === 'admin'} /> : null}
          {activeScreen === 'Finance' ? <FinanceScreen key={activeScreen} onExpenses={() => navigate('Expenses')} /> : null}
          {activeScreen === 'Expenses' ? <ExpensesScreen key={activeScreen} isAdmin={user.role === 'admin'} /> : null}
          {activeScreen === 'Reports' ? <ReportsScreen key={activeScreen} /> : null}
          {activeScreen === 'Team' && user.role === 'admin' ? <TeamScreen key={activeScreen} currentUser={user} /> : null}
          {activeScreen === 'Profile' ? (
            <Page title="Profile" subtitle="Your account and session settings.">
              <Card>
                <Row title="Name" detail={user.name} />
                <Row title="Username" detail={user.username} />
                <Row title="Email" detail={user.email} />
                <Row title="Role" detail={user.role} />
              </Card>
              <Button title="Sign out" secondary onPress={confirmLogout} />
            </Page>
          ) : null}
        </ScrollVisibilityContext.Provider>
      </View>
      {bottomNavVisible ? (
        <View style={styles.bottomNav}>
          {bottomTabs.map(({ label, icon }) => (
            <Pressable
              key={label}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: activeScreen === label }}
              onPress={() => navigateTab(label)}
              style={styles.bottomTab}
            >
              <Text style={[styles.bottomTabIcon, activeScreen === label && styles.bottomTabIconSelected]}>{icon}</Text>
              <Text style={[styles.bottomTabLabel, activeScreen === label && styles.bottomTabLabelSelected]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <Modal visible={menuOpen} animationType="fade" transparent onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.menuOverlay}>
          <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Close menu" onPress={() => setMenuOpen(false)} />
          <SafeAreaView style={styles.drawer} edges={['top', 'bottom']}>
            <View style={styles.drawerHeader}>
              <View>
                <Text style={styles.drawerBrand}>Viatech</Text>
                <Text style={styles.drawerAccount}>{user.name} · {user.role}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close navigation menu"
                onPress={() => setMenuOpen(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>
            <Text style={styles.drawerLabel}>WORKSPACE</Text>
            <ScrollView contentContainerStyle={styles.menuItems}>
              {allowedScreens.map((name) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: activeScreen === name }}
                  key={name}
                  onPress={() => navigate(name)}
                  style={[styles.menuItem, activeScreen === name && styles.menuItemSelected]}
                >
                  <Text style={[styles.menuItemText, activeScreen === name && styles.menuItemTextSelected]}>{name}</Text>
                  {activeScreen === name ? <Text style={styles.menuItemCheck}>●</Text> : null}
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.drawerFooter}>
              <Text style={styles.drawerFootnote}>Signed in as {user.username}</Text>
              <Button title="Sign out" secondary onPress={confirmLogout} />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.canvas },
  navigation: { backgroundColor: colors.white, borderBottomColor: colors.line, borderBottomWidth: 1, paddingHorizontal: 16 },
  navHeader: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#f1f5fb', alignItems: 'center', justifyContent: 'center' },
  iconText: { color: colors.ink, fontSize: 34, lineHeight: 38, marginTop: -4 },
  brandBlock: { flex: 1 },
  brand: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  account: { color: colors.muted, fontSize: 10, marginTop: 2 },
  menuButton: { width: 42, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#eef3fc', borderWidth: 1, borderColor: '#dbe5f5' },
  menuIcon: { color: colors.blue, fontSize: 17, fontWeight: '700' },
  content: { flex: 1 },
  bottomNav: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 8 },
  bottomTab: { minWidth: 62, minHeight: 54, alignItems: 'center', justifyContent: 'center', gap: 2 },
  bottomTabIcon: { color: '#8593a5', fontSize: 19, fontWeight: '700' },
  bottomTabIconSelected: { color: colors.blue },
  bottomTabLabel: { color: '#8593a5', fontSize: 9, fontWeight: '600' },
  bottomTabLabelSelected: { color: colors.blue, fontWeight: '800' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'stretch', gap: 14, padding: 24, backgroundColor: colors.canvas },
  title: { color: colors.ink, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  helper: { color: colors.muted, fontSize: 13, textAlign: 'center' },
  menuOverlay: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: '#14274066' },
  drawer: { width: '84%', maxWidth: 340, backgroundColor: colors.white, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 8, borderTopLeftRadius: 22, borderBottomLeftRadius: 22, overflow: 'hidden' },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  drawerBrand: { color: colors.ink, fontSize: 22, fontWeight: '900' },
  drawerAccount: { color: colors.muted, fontSize: 11, marginTop: 4, textTransform: 'capitalize' },
  closeButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#f1f5fb', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.ink, fontSize: 27, lineHeight: 30, marginTop: -2 },
  drawerLabel: { color: '#96a2b1', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginTop: 22, marginBottom: 10 },
  menuItems: { gap: 6, paddingBottom: 16 },
  menuItem: { minHeight: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 },
  menuItemSelected: { backgroundColor: '#eef3fc' },
  menuItemText: { color: '#51647b', fontSize: 14, fontWeight: '600' },
  menuItemTextSelected: { color: colors.blue, fontWeight: '800' },
  menuItemCheck: { color: colors.blue, fontSize: 10 },
  drawerFooter: { gap: 9, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line },
  drawerFootnote: { color: colors.muted, fontSize: 10 },
});
