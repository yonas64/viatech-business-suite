import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apiRequest, jsonBody, saveToken } from './api';
import type { User } from './types';
import { Button, Card, Field, Notice, colors } from './ui';

type LoginResponse = { access_token: string; user: User };

export function AuthScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [registering, setRegistering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    username: '',
    emailOrUsername: '',
    email: '',
    password: '',
  });

  async function submit() {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      if (registering) {
        await apiRequest('/auth/register', {
          method: 'POST',
          body: jsonBody({
            name: form.name,
            username: form.username,
            email: form.email,
            password: form.password,
          }),
        });
        setRegistering(false);
        setForm((current) => ({ ...current, emailOrUsername: current.username }));
        setSuccess('Your staff account is ready. Sign in to continue.');
      } else {
        const result = await apiRequest<LoginResponse>('/auth/login', {
          method: 'POST',
          body: jsonBody({
            emailOrUsername: form.emailOrUsername,
            password: form.password,
          }),
        });
        await saveToken(result.access_token);
        onLogin(result.user);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View pointerEvents="none" style={styles.background}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.brand}>
            <View style={styles.brandMark}><Text style={styles.brandLetter}>V</Text></View>
            <View style={styles.brandText}>
              <Text style={styles.brandName}>viatech</Text>
              <Text style={styles.brandSub}>BUSINESS SUITE</Text>
            </View>
            <View style={styles.secureBadge}>
              <View style={styles.secureDot} />
              <Text style={styles.secureText}>YOUR WORKSPACE</Text>
            </View>
          </View>

          <View style={styles.intro}>
            <Text style={styles.kicker}>BUSINESS, IN GOOD HANDS</Text>
            <Text style={styles.title}>{registering ? 'Let’s get you set up.' : 'Welcome back.'}</Text>
            <Text style={styles.subtitle}>
              {registering
                ? 'Create a staff account to join your Viatech workspace.'
                : 'Sign in to keep your products, stock, and sales moving.'}
            </Text>
          </View>

          <Card style={styles.formCard}>
            <View style={styles.formHeading}>
              <Text style={styles.formTitle}>{registering ? 'Create account' : 'Sign in'}</Text>
              <Text style={styles.formHint}>{registering ? 'A few details and you’re in.' : 'Enter your account details below.'}</Text>
            </View>
            {error ? <Notice>{error}</Notice> : null}
            {success ? <Notice success>{success}</Notice> : null}
            {registering ? <>
              <Field label="Full name" value={form.name} onChangeText={(name) => setForm({ ...form, name })} placeholder="Jordan Lee" required />
              <Field label="Username" value={form.username} onChangeText={(username) => setForm({ ...form, username })} placeholder="jordan" autoCapitalize="none" required />
              <Field label="Email address" value={form.email} onChangeText={(email) => setForm({ ...form, email })} keyboardType="email-address" placeholder="you@company.com" autoCapitalize="none" required />
            </> : <Field label="Email or username" value={form.emailOrUsername} onChangeText={(emailOrUsername) => setForm({ ...form, emailOrUsername })} placeholder="you@company.com" autoCapitalize="none" required />}
            <Field label="Password" value={form.password} onChangeText={(password) => setForm({ ...form, password })} secureTextEntry placeholder={registering ? 'At least 6 characters' : 'Enter your password'} required />
            <Button title={busy ? 'Please wait…' : registering ? 'Create staff account' : 'Sign in to Viatech'} onPress={() => void submit()} disabled={busy} />
            <View style={styles.switchRow}>
              <Text style={styles.switchPrompt}>{registering ? 'Already have an account?' : 'New to Viatech?'}</Text>
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => { setRegistering(!registering); setError(''); setSuccess(''); }}
              >
                <Text style={styles.switchText}>{registering ? 'Sign in' : 'Create a staff account'}</Text>
              </Pressable>
            </View>
          </Card>
          <Text style={styles.footer}>Secure access to your business workspace</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2e' },
  background: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden', backgroundColor: '#0d1b2e' },
  glowTop: { position: 'absolute', width: 330, height: 330, borderRadius: 165, top: -160, right: -115, backgroundColor: '#173b67', opacity: 0.85 },
  glowBottom: { position: 'absolute', width: 280, height: 280, borderRadius: 140, bottom: -155, left: -145, backgroundColor: '#075f62', opacity: 0.42 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 30 },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: 24 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  brandMark: { width: 46, height: 46, borderRadius: 15, backgroundColor: '#4f82ff', alignItems: 'center', justifyContent: 'center', shadowColor: '#4480ff', shadowOpacity: 0.36, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  brandLetter: { color: '#fff', fontSize: 25, fontWeight: '900' },
  brandText: { flex: 1 },
  brandName: { color: '#fff', fontSize: 21, fontWeight: '900', letterSpacing: 0.1 },
  brandSub: { color: '#91a8c5', marginTop: 3, fontSize: 8, letterSpacing: 1.8, fontWeight: '800' },
  secureBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#29405d', backgroundColor: '#142943', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7 },
  secureDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#57d5a3' },
  secureText: { color: '#b9c9dc', fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  intro: { gap: 8, marginTop: 2 },
  kicker: { color: '#82a9ff', fontSize: 9, letterSpacing: 1.8, fontWeight: '900', marginBottom: 2 },
  title: { color: '#fff', fontSize: 31, fontWeight: '900', letterSpacing: -0.7 },
  subtitle: { color: '#a8b8cc', fontSize: 13, lineHeight: 20, maxWidth: 330 },
  formCard: { padding: 20, borderRadius: 19, borderColor: '#e5ebf4', gap: 14, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 25, shadowOffset: { width: 0, height: 12 }, elevation: 9 },
  formHeading: { gap: 4, marginBottom: 1 },
  formTitle: { color: colors.ink, fontSize: 19, fontWeight: '900', letterSpacing: -0.2 },
  formHint: { color: colors.muted, fontSize: 11 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 5, paddingTop: 2 },
  switchPrompt: { color: colors.muted, fontSize: 11 },
  switchText: { color: colors.blue, fontSize: 11, fontWeight: '800', paddingVertical: 4 },
  footer: { color: '#8295ad', fontSize: 10, textAlign: 'center', marginTop: -7, letterSpacing: 0.2 },
});
