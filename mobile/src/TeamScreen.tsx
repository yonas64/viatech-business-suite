import { useEffect, useState } from 'react';
import { Alert, Modal, View } from 'react-native';
import { apiRequest, jsonBody } from './api';
import { shortDate } from './format';
import type { User } from './types';
import { Button, Card, Empty, Field, Notice, Page, Row, SectionTitle, SelectField } from './ui';

export function TeamScreen({ currentUser }: { currentUser: User }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    try { setUsers(await apiRequest<User[]>('/users')); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load team members.'); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    void load();
  }, []);

  async function create() {
    if (!name.trim() || !username.trim() || !email.trim() || password.length < 6) {
      setError('Enter a name, username, email, and password with at least 6 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await apiRequest('/users', {
        method: 'POST',
        body: jsonBody({ name, username, email, password, role }),
      });
      setEditor(false);
      setName(''); setUsername(''); setEmail(''); setPassword(''); setRole('staff');
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not create user.'); }
    finally { setBusy(false); }
  }

  async function changeRole(member: User, nextRole: string) {
    try {
      const id = member._id ?? member.id;
      const updated = await apiRequest<User>(`/users/${id}`, {
        method: 'PATCH',
        body: jsonBody({ role: nextRole }),
      });
      setUsers((current) => current.map((user) => (user._id ?? user.id) === id ? updated : user));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not update user role.'); }
  }

  function remove(member: User) {
    if ((member._id ?? member.id) === (currentUser._id ?? currentUser.id)) return;
    Alert.alert('Remove team member?', `Remove ${member.name} from the workspace?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        const id = member._id ?? member.id;
        void apiRequest(`/users/${id}`, { method: 'DELETE' })
          .then(() => setUsers((current) => current.filter((user) => (user._id ?? user.id) !== id)))
          .catch((cause: Error) => setError(cause.message));
      } },
    ]);
  }

  return (
    <Page title="Team" subtitle="Administer accounts and workspace roles."
      action={<Button title="+ Add member" onPress={() => { setEditor(true); setError(''); }} small />}>
      {error ? <Notice>{error}</Notice> : null}
      <Card>
        <SectionTitle>Workspace members ({users.length})</SectionTitle>
        {loading ? <Empty>Loading team…</Empty> : users.length ? users.map((member) => {
          const id = member._id ?? member.id;
          const isSelf = id === (currentUser._id ?? currentUser.id);
          return (
            <View key={id} style={{ gap: 6, borderBottomWidth: 1, borderBottomColor: '#eef1f5', paddingBottom: 10 }}>
              <Row title={member.name} detail={`${member.username} · ${member.email}${member.createdAt ? ` · joined ${shortDate(member.createdAt)}` : ''}`} />
              <SelectField label="Role" value={member.role} options={[
                { label: 'Staff', value: 'staff' },
                { label: 'Admin', value: 'admin' },
              ]} onChange={(value) => { if (!isSelf) void changeRole(member, value); }} />
              {!isSelf ? <Button title="Remove member" danger small onPress={() => remove(member)} /> : null}
            </View>
          );
        }) : <Empty>No team members found.</Empty>}
      </Card>
      <Modal visible={editor} animationType="slide" onRequestClose={() => setEditor(false)}>
        <Page title="Add team member" subtitle="Create an account for your workspace.">
          {error ? <Notice>{error}</Notice> : null}
          <Field label="Full name" value={name} onChangeText={setName} required />
          <Field label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" required />
          <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" required />
          <Field label="Temporary password" value={password} onChangeText={setPassword} secureTextEntry required />
          <SelectField label="Role" value={role} options={[{ label: 'Staff', value: 'staff' }, { label: 'Admin', value: 'admin' }]} onChange={(value) => setRole(value as typeof role)} />
          <Button title={busy ? 'Creating…' : 'Create member'} onPress={() => void create()} disabled={busy} />
          <Button title="Cancel" secondary onPress={() => setEditor(false)} />
        </Page>
      </Modal>
    </Page>
  );
}
