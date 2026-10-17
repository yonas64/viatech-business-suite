import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
import { Button, SelectField, colors } from './src/ui';

const screens = ['Home', 'Products', 'Stock', 'Sales', 'Categories', 'Finance', 'Expenses', 'Reports', 'Team'];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState('Home');
  const [starting, setStarting] = useState(true);
  const [startupError, setStartupError] = useState('');
  const [retry, setRetry] = useState(0);
  const signOut = useCallback(() => {
    setUser(null);
    setScreen('Home');
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

  async function logout() {
    try { await clearToken(); }
    catch (cause) {
      setStartupError(cause instanceof Error ? cause.message : 'Could not clear your saved session.');
      return;
    }
    signOut();
  }

  if (starting) {
    return <View style={styles.center}><ActivityIndicator color={colors.blue} /><Text style={styles.helper}>Connecting to your workspace…</Text><StatusBar style="dark" /></View>;
  }
  if (!user) {
    if (startupError) {
      return <View style={styles.center}>
        <Text style={styles.title}>Couldn’t restore your session</Text>
        <Text style={styles.helper}>{startupError}</Text>
        <Button title="Try again" onPress={() => { setStarting(true); setRetry((value) => value + 1); }} />
        <Button title="Continue to sign in" secondary onPress={() => {
          void clearToken()
            .then(() => setStartupError(''))
            .catch((cause: Error) => setStartupError(cause.message));
        }} />
        <StatusBar style="dark" />
      </View>;
    }
    return <><AuthScreen onLogin={setUser} /><StatusBar style="light" /></>;
  }

  const allowedScreens = screens.filter((name) => name !== 'Team' || user.role === 'admin');
  const activeScreen = allowedScreens.includes(screen) ? screen : 'Home';
  const navigate = (target: string) => setScreen(target === 'Inventory' ? 'Stock' : target);
  return (
    <SafeAreaView style={styles.app}>
      <View style={styles.navigation}>
        <View style={styles.navHeader}>
          <View><Text style={styles.brand}>Viatech</Text><Text style={styles.account}>{user.name} · {user.role}</Text></View>
          <Button title="Sign out" secondary small onPress={() => void logout()} />
        </View>
        <SelectField label="Go to" value={activeScreen} options={allowedScreens.map((name) => ({ label: name, value: name }))} onChange={setScreen} />
      </View>
      <View style={styles.content}>
        {activeScreen === 'Home' ? <DashboardScreen key={activeScreen} user={user} onNavigate={navigate} /> : null}
        {activeScreen === 'Products' ? <ProductsScreen key={activeScreen} isAdmin={user.role === 'admin'} /> : null}
        {activeScreen === 'Stock' ? <InventoryScreen key={activeScreen} isAdmin={user.role === 'admin'} /> : null}
        {activeScreen === 'Sales' ? <SalesScreen key={activeScreen} /> : null}
        {activeScreen === 'Categories' ? <CategoriesScreen key={activeScreen} isAdmin={user.role === 'admin'} /> : null}
        {activeScreen === 'Finance' ? <FinanceScreen key={activeScreen} onExpenses={() => setScreen('Expenses')} /> : null}
        {activeScreen === 'Expenses' ? <ExpensesScreen key={activeScreen} isAdmin={user.role === 'admin'} /> : null}
        {activeScreen === 'Reports' ? <ReportsScreen key={activeScreen} /> : null}
        {activeScreen === 'Team' && user.role === 'admin' ? <TeamScreen key={activeScreen} currentUser={user} /> : null}
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.canvas },
  navigation: { backgroundColor: colors.white, borderBottomColor: colors.line, borderBottomWidth: 1, paddingHorizontal: 16, paddingTop: 8 },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1 },
  brand: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  account: { color: colors.muted, fontSize: 10, marginTop: 2, textTransform: 'capitalize' },
  content: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'stretch', gap: 14, padding: 24, backgroundColor: colors.canvas },
  title: { color: colors.ink, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  helper: { color: colors.muted, fontSize: 13, textAlign: 'center' },
});
