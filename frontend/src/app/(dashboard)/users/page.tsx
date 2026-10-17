"use client";

import { useEffect, useState, type FormEvent } from 'react';
import { apiRequest, jsonBody } from '@/lib/api/config';
import { shortDate } from '@/lib/format';
import type { User } from '@/lib/types';
import { useCurrentUser } from '@/components/auth-context';
import { EmptyState, Notice, PageHeading, SectionTitle } from '@/components/ui';

type ManagedUser = User & { _id: string; createdAt?: string };

export default function UsersPage() {
  const currentUser = useCurrentUser();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', role: 'staff' as User['role'] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    try { setUsers(await apiRequest<ManagedUser[]>('/users')); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load team members.'); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (currentUser?.role !== 'admin') return;
    apiRequest<ManagedUser[]>('/users')
      .then(setUsers)
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, [currentUser]);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await apiRequest('/users', { method: 'POST', body: jsonBody(form) });
      setForm({ name: '', username: '', email: '', password: '', role: 'staff' });
      setShowForm(false);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not add team member.'); }
    finally { setBusy(false); }
  }

  async function updateRole(member: ManagedUser, role: User['role']) {
    setError('');
    try {
      const updated = await apiRequest<ManagedUser>(`/users/${member._id}`, {
        method: 'PATCH',
        body: jsonBody({ role }),
      });
      setUsers((items) => items.map((item) => item._id === member._id ? updated : item));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not update team role.'); }
  }

  async function removeUser(member: ManagedUser) {
    if (member._id === currentUser?.id) return;
    if (!window.confirm(`Remove ${member.name} from this workspace?`)) return;
    setError('');
    try {
      await apiRequest(`/users/${member._id}`, { method: 'DELETE' });
      setUsers((items) => items.filter((item) => item._id !== member._id));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not remove team member.'); }
  }

  if (currentUser?.role !== 'admin') {
    return <><PageHeading eyebrow="WORKSPACE" title="Team" description="Manage who can access your Viatech workspace." /><Notice>You need admin access to manage team members.</Notice></>;
  }

  return <>
    <PageHeading eyebrow="WORKSPACE" title="Team" description="Manage the people who can access your Viatech workspace."
      action={<button className="button button-primary" onClick={() => setShowForm(!showForm)}><span>＋</span> Add team member</button>} />
    {error && <Notice>{error}</Notice>}
    {showForm && <section className="panel form-panel">
      <SectionTitle title="Add a team member" description="Create a login for a new member of your team." />
      <form className="form-grid" onSubmit={createUser}>
        <label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Jordan Lee" /></label>
        <label>Username<input required value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="jordan" /></label>
        <label>Email address<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="jordan@company.com" /></label>
        <label>Temporary password<input type="password" minLength={6} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 6 characters" /></label>
        <label>Workspace role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as User['role'] })}><option value="staff">Staff</option><option value="admin">Admin</option></select></label>
        <div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button></div>
      </form>
    </section>}
    <section className="panel">
      <SectionTitle title="Workspace members" description={`${users.length} registered account${users.length === 1 ? '' : 's'}`} />
      {loading ? <div className="loading-state">Loading team members…</div> : users.length ? <div className="table-wrap">
        <table><thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr></thead>
          <tbody>{users.map((member) => <tr key={member._id}>
            <td><div className="member-cell"><span className="avatar member-avatar">{member.name.slice(0, 1).toUpperCase()}</span><strong>{member.name}{member._id === currentUser.id && <small className="table-subtitle">You</small>}</strong></div></td>
            <td>{member.username}</td><td>{member.email}</td>
            <td><select aria-label={`Role for ${member.name}`} className="role-select" disabled={member._id === currentUser.id} value={member.role} onChange={(event) => void updateRole(member, event.target.value as User['role'])}><option value="staff">Staff</option><option value="admin">Admin</option></select></td>
            <td>{shortDate(member.createdAt)}</td>
            <td className="align-right">{member._id !== currentUser.id && <button className="icon-button danger-button" title={`Remove ${member.name}`} onClick={() => void removeUser(member)}>×</button>}</td>
          </tr>)}</tbody>
        </table>
      </div> : <EmptyState>No team members found.</EmptyState>}
    </section>
  </>;
}
