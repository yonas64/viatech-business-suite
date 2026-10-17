"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api/config';
import { money } from '@/lib/format';
import type { FinanceSummary } from '@/lib/types';
import { Notice, PageHeading, SectionTitle, StatCard } from '@/components/ui';

export default function FinancePage() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(fromDate = from, toDate = to) {
    setLoading(true);
    setError('');
    try {
      const query = fromDate && toDate ? `?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}` : '';
      setSummary(await apiRequest<FinanceSummary>(`/finance/summary${query}`));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load financial data.'); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    apiRequest<FinanceSummary>('/finance/summary')
      .then(setSummary)
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  return <>
    <PageHeading eyebrow="BUSINESS PERFORMANCE" title="Finance" description="Understand your sales, margins, and business expenses."
      action={<Link className="button button-primary" href="/expenses">Manage expenses <span>→</span></Link>} />
    {error && <Notice>{error}</Notice>}
    <section className="panel filter-panel">
      <div className="filter-heading"><div><strong>Financial period</strong><small>Choose a date range to filter your summary and expenses.</small></div>
        <form className="filter-controls" onSubmit={(event) => { event.preventDefault(); void load(from, to); }}>
          <label>From<input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} /></label>
          <label>To<input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} /></label>
          <button className="button button-secondary" disabled={loading || Boolean(from) !== Boolean(to)}>Apply</button>
          {(from || to) && <button type="button" className="text-button" onClick={() => { setFrom(''); setTo(''); void load('', ''); }}>Clear</button>}
        </form>
      </div>
      {Boolean(from) !== Boolean(to) && <small className="inline-help">Choose both start and end dates to apply the filter.</small>}
    </section>
    <div className="stats-grid">
      <StatCard label="Sales revenue" value={loading ? '—' : money(summary?.totalSales)} note={`${summary?.transactionCount ?? 0} transactions`} />
      <StatCard label="Collected" value={loading ? '—' : money(summary?.totalCollected)} note="Payments received" tone="green" />
      <StatCard label="Outstanding" value={loading ? '—' : money(summary?.totalDue)} note="Pending payment" tone="orange" />
      <StatCard label="Estimated profit" value={loading ? '—' : money(summary?.estimatedProfit)} note="After operating expenses" tone="purple" />
    </div>
    <div className="finance-summary-grid">
      <article className="panel finance-breakdown"><SectionTitle title="Profit breakdown" description="A high-level view of your business performance." />
        <div className="breakdown-list">
          <div><span>Sales before VAT</span><strong>{money(summary?.salesSubtotal)}</strong></div>
          <div><span>VAT collected</span><strong>{money(summary?.totalVat)}</strong></div>
          <div><span>Cost of goods sold</span><strong className="negative">− {money(summary?.costOfGoodsSold)}</strong></div>
          <div><span>Operating expenses</span><strong className="negative">− {money(summary?.expenses)}</strong></div>
          <div className="breakdown-total"><span>Estimated net profit</span><strong>{money(summary?.estimatedProfit)}</strong></div>
        </div>
      </article>
      <article className="finance-side-stat"><div className="eyebrow">INVENTORY VALUE</div><strong>{loading ? '—' : money(summary?.currentInventoryCost)}</strong><p>Current cost value of active stock on hand.</p><div className="finance-side-footer">Expected margin on current stock <b>{money(summary?.expectedProfit)}</b></div></article>
    </div>
    <section className="panel expense-teaser">
      <div><div className="eyebrow">OPERATING COSTS</div><h2>Keep expense records up to date</h2><p>Record supplier costs, bills, and other operating expenses. They flow into your profit calculations and reports.</p></div>
      <Link className="button button-secondary" href="/expenses">Open expense register <span>→</span></Link>
    </section>
  </>;
}
