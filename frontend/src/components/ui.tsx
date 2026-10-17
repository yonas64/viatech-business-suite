import type { ReactNode } from 'react';

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  note,
  tone = 'blue',
}: {
  label: string;
  value: string | number;
  note?: string;
  tone?: 'blue' | 'green' | 'orange' | 'purple';
}) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-label">{label}</div>
      <strong>{value}</strong>
      {note && <div className="stat-note">{note}</div>}
    </article>
  );
}

export function Notice({
  children,
  kind = 'error',
}: {
  children: ReactNode;
  kind?: 'error' | 'success' | 'info';
}) {
  return <div className={`notice notice-${kind}`}>{children}</div>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>;
}

export function LoadingState() {
  return <div className="loading-state">Loading your workspace…</div>;
}

export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
