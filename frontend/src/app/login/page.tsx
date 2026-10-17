"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { apiRequest, jsonBody, setToken } from '@/lib/api/config';
import type { User } from '@/lib/types';
import { Notice } from '@/components/ui';

type LoginResponse = { access_token: string; user: User };

export default function LoginPage() {
  const router = useRouter();
  const [registering, setRegistering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', username: '', emailOrUsername: '', email: '', password: '' });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
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
        setMessage('Your staff account is ready. Sign in to continue.');
      } else {
        const result = await apiRequest<LoginResponse>('/auth/login', {
          method: 'POST',
          body: jsonBody({
            emailOrUsername: form.emailOrUsername,
            password: form.password,
          }),
        });
        setToken(result.access_token);
        router.replace('/overview');
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to complete this request.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-showcase">
        <Link href="/" className="brand brand-light"><span className="brand-mark">V</span><span><strong>viatech</strong><small>BUSINESS SUITE</small></span></Link>
        <div className="showcase-copy">
          <div className="eyebrow">A BETTER WAY TO RUN YOUR BUSINESS</div>
          <h1>Know your numbers.<br /><em>Grow with confidence.</em></h1>
          <p>One workspace for your products, stock, sales, and the details that keep your business moving.</p>
        </div>
        <div className="showcase-foot"><span>●</span> Your business, beautifully in sync.</div>
        <div className="showcase-orb orb-one" /><div className="showcase-orb orb-two" />
      </div>
      <div className="login-side">
        <div className="login-form-wrap">
          <div className="mobile-brand brand"><span className="brand-mark">V</span><span><strong>viatech</strong><small>BUSINESS SUITE</small></span></div>
          <div className="eyebrow">{registering ? 'GET YOUR TEAM STARTED' : 'WELCOME BACK'}</div>
          <h2>{registering ? 'Create your account' : 'Sign in to Viatech'}</h2>
          <p className="login-description">{registering ? 'Set up a staff account to start managing your workspace.' : 'Enter your details to access your business workspace.'}</p>
          {error && <Notice>{error}</Notice>}
          {message && <Notice kind="success">{message}</Notice>}
          <form className="form-stack login-form" onSubmit={submit}>
            {registering && <>
              <label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Jordan Lee" /></label>
              <label>Username<input required value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="jordan" /></label>
              <label>Email address<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@company.com" /></label>
            </>}
            {!registering && <label>Email or username<input autoComplete="username" required value={form.emailOrUsername} onChange={(event) => setForm({ ...form, emailOrUsername: event.target.value })} placeholder="you@company.com" /></label>}
            <label>Password<input type="password" autoComplete={registering ? 'new-password' : 'current-password'} minLength={registering ? 6 : undefined} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 6 characters" /></label>
            <button className="button button-primary button-wide" disabled={busy}>{busy ? 'Please wait…' : registering ? 'Create staff account' : 'Sign in'} <span>→</span></button>
          </form>
          <p className="login-switch">
            {registering ? 'Already have an account?' : 'New to Viatech?'}{' '}
            <button onClick={() => { setError(''); setMessage(''); setRegistering(!registering); }}>{registering ? 'Sign in' : 'Create a staff account'}</button>
          </p>
          <div className="login-note">By continuing, you agree to keep your account credentials secure.</div>
        </div>
      </div>
    </main>
  );
}
