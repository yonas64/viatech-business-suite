"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { apiRequest, clearToken, getToken } from '@/lib/api/config';
import type { User } from '@/lib/types';
import { AuthProvider } from '@/components/auth-context';

const navigation = [
  { href: '/overview', label: 'Overview', icon: '◫' },
  { href: '/products', label: 'Products', icon: '▦' },
  { href: '/categories', label: 'Categories', icon: '◈' },
  { href: '/inventory', label: 'Inventory', icon: '▤' },
  { href: '/sales', label: 'Sales', icon: '↗' },
  { href: '/finance', label: 'Finance', icon: '$' },
  { href: '/expenses', label: 'Expenses', icon: '−' },
  { href: '/reports', label: 'Reports', icon: '▥' },
  { href: '/users', label: 'Team', icon: '♧', adminOnly: true },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    apiRequest<User>('/auth/me')
      .then(setUser)
      .catch(() => {
        clearToken();
        router.replace('/login');
      })
      .finally(() => setReady(true));
  }, [router]);

  function signOut() {
    clearToken();
    router.replace('/login');
  }

  if (!ready || !user) {
    return <main className="auth-loading">Preparing your workspace…</main>;
  }

  return (
    <div className="app-frame">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <Link href="/overview" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">V</span>
          <span>
            <strong>viatech</strong>
            <small>BUSINESS SUITE</small>
          </span>
        </Link>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.filter((item) => !('adminOnly' in item) || !item.adminOnly || user.role === 'admin').map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'nav-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.href === '/inventory' && (
                <span className="nav-dot" aria-label="Inventory" />
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-card">
            <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
            <span className="user-details">
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </span>
            <button className="icon-button signout" onClick={signOut} aria-label="Sign out">
              ↗
            </button>
          </div>
        </div>
      </aside>
      {menuOpen && <button className="mobile-scrim" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}
      <div className="main-column">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">
            ☰
          </button>
          <div className="breadcrumb">Viatech <span>/</span> {navigation.find((item) => item.href === pathname)?.label ?? 'Workspace'}</div>
          <div className="topbar-right">
            <span className="connection"><i /> Connected</span>
            <span className="topbar-date">{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date())}</span>
          </div>
        </header>
        <AuthProvider user={user}><main className="page-content">{children}</main></AuthProvider>
        <footer className="app-footer">Viatech Management <span>Inventory, sales &amp; finance in one place.</span></footer>
      </div>
    </div>
  );
}
