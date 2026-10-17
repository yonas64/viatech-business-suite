"use client";

import { useEffect, useState, type FormEvent } from 'react';
import { apiRequest, jsonBody } from '@/lib/api/config';
import { money, shortDate } from '@/lib/format';
import type { Expense, PageResult } from '@/lib/types';
import { useCurrentUser } from '@/components/auth-context';
import { EmptyState, Notice, PageHeading, SectionTitle, StatCard } from '@/components/ui';

const PAGE_SIZE = 20;

function localDate(value?: string) {
  const date = value ? new Date(value) : new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

type ExpenseDraft = {
  category: string;
  amount: string;
  expenseDate: string;
  description: string;
  reference: string;
  receiptUrl: string;
};

function emptyDraft(): ExpenseDraft {
  return { category: '', amount: '', expenseDate: localDate(), description: '', reference: '', receiptUrl: '' };
}

export default function ExpensesPage() {
  const user = useCurrentUser();
  const [result, setResult] = useState<PageResult<Expense> | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ from: '', to: '', category: '' });
  const [page, setPage] = useState(1);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<ExpenseDraft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (appliedFilters.from) {
      params.set('from', new Date(`${appliedFilters.from}T00:00:00.000Z`).toISOString());
    }
    if (appliedFilters.to) {
      params.set('to', new Date(`${appliedFilters.to}T23:59:59.999Z`).toISOString());
    }
    if (appliedFilters.category) params.set('category', appliedFilters.category);

    apiRequest<PageResult<Expense>>(`/expenses?${params}`)
      .then(setResult)
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, [page, appliedFilters]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPage(1);
    setAppliedFilters({ from, to, category: category.trim() });
    setLoading(true);
  }

  function openCreateForm() {
    setEditingExpense(null);
    setDraft(emptyDraft());
    setShowForm(true);
    setError('');
  }

  function openEditForm(expense: Expense) {
    setEditingExpense(expense);
    setDraft({
      category: expense.category,
      amount: String(expense.amount),
      expenseDate: localDate(expense.expenseDate),
      description: expense.description,
      reference: expense.reference ?? '',
      receiptUrl: expense.receiptUrl ?? '',
    });
    setShowForm(true);
    setError('');
  }

  async function saveExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = {
        ...draft,
        amount: Number(draft.amount),
        expenseDate: new Date(`${draft.expenseDate}T12:00:00`).toISOString(),
        receiptUrl: draft.receiptUrl.trim() || undefined,
      };
      await apiRequest(
        editingExpense ? `/expenses/${editingExpense._id}` : '/expenses',
        {
          method: editingExpense ? 'PATCH' : 'POST',
          body: jsonBody(payload),
        },
      );
      setShowForm(false);
      setEditingExpense(null);
      setDraft(emptyDraft());
      setLoading(true);
      setPage(1);
      setAppliedFilters((current) => ({ ...current }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the expense.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteExpense(expense: Expense) {
    if (!window.confirm(`Delete the expense "${expense.description}"?`)) return;
    setError('');
    try {
      await apiRequest(`/expenses/${expense._id}`, { method: 'DELETE' });
      setLoading(true);
      if (result?.items.length === 1 && page > 1) setPage((current) => current - 1);
      else setAppliedFilters((current) => ({ ...current }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete the expense.');
    }
  }

  const canManage = user?.role === 'admin';

  return <>
    <PageHeading
      eyebrow="FINANCE"
      title="Expenses"
      description="Record and review operating costs so your profit picture stays accurate."
      action={canManage && <button className="button button-primary" onClick={openCreateForm}><span>＋</span> Record expense</button>}
    />
    {error && <Notice>{error}</Notice>}
    <div className="stats-grid stats-three">
      <StatCard label="Expenses in view" value={loading ? '—' : result?.total ?? 0} note="Matching your filters" />
      <StatCard label="Total expenses" value={loading ? '—' : money(result?.amount)} note="For the selected filters" tone="orange" />
      <StatCard label="Current page" value={loading ? '—' : `${page} / ${Math.max(result?.totalPages ?? 1, 1)}`} note={`${PAGE_SIZE} records per page`} tone="purple" />
    </div>
    <section className="panel expense-filter-panel">
      <SectionTitle title="Find expenses" description="Filter by expense date or category." />
      <form className="expense-filters" onSubmit={applyFilters}>
        <label>From<input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} /></label>
        <label>To<input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} /></label>
        <label>Category<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="e.g. rent, supplies" /></label>
        <button className="button button-primary" disabled={loading || Boolean(from) !== Boolean(to)}>Apply filters</button>
        {(from || to || category) && <button type="button" className="text-button expense-clear" onClick={() => {
          setFrom('');
          setTo('');
          setCategory('');
          setPage(1);
          setAppliedFilters({ from: '', to: '', category: '' });
          setLoading(true);
        }}>Clear</button>}
      </form>
      {Boolean(from) !== Boolean(to) && <small className="inline-help">Choose both dates to filter by a date range.</small>}
    </section>
    {showForm && canManage && <section className="panel form-panel">
      <SectionTitle
        title={editingExpense ? 'Edit expense' : 'Record an expense'}
        description="Expense records are included in finance and profit reports."
      />
      <form className="form-grid" onSubmit={saveExpense}>
        <label>Category<input required value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} placeholder="e.g. rent, utilities, supplies" /></label>
        <label>Amount<input required type="number" min="0.01" step="0.01" value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} /></label>
        <label>Expense date<input required type="date" value={draft.expenseDate} onChange={(event) => setDraft({ ...draft, expenseDate: event.target.value })} /></label>
        <label>Reference <span className="optional">Optional</span><input value={draft.reference} onChange={(event) => setDraft({ ...draft, reference: event.target.value })} placeholder="Receipt or invoice number" /></label>
        <label className="span-two">Description<input required value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="What was this expense for?" /></label>
        <label className="span-two">Receipt URL <span className="optional">Optional</span><input type="url" value={draft.receiptUrl} onChange={(event) => setDraft({ ...draft, receiptUrl: event.target.value })} placeholder="https://…" /></label>
        <div className="form-actions span-two">
          <button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          <button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : editingExpense ? 'Save changes' : 'Save expense'}</button>
        </div>
      </form>
    </section>}
    <section className="panel">
      <SectionTitle title="Expense register" description="Your expense records, newest first." />
      {loading ? <div className="loading-state">Loading expenses…</div> : result?.items.length ? <>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Expense</th><th>Category</th><th>Date</th><th>Reference</th><th>Receipt</th><th className="align-right">Amount</th>{canManage && <th>Actions</th>}</tr></thead>
            <tbody>{result.items.map((expense) => <tr key={expense._id}>
              <td><strong>{expense.description}</strong></td>
              <td><span className="category-pill">{expense.category}</span></td>
              <td>{shortDate(expense.expenseDate)}</td>
              <td>{expense.reference || '—'}</td>
              <td>{expense.receiptUrl ? <a className="text-link" href={expense.receiptUrl} target="_blank" rel="noreferrer">View receipt ↗</a> : '—'}</td>
              <td className="align-right"><strong>{money(expense.amount)}</strong></td>
              {canManage && <td><div className="expense-actions">
                <button className="button button-secondary" onClick={() => openEditForm(expense)}>Edit</button>
                <button className="button expense-delete" onClick={() => void deleteExpense(expense)}>Delete</button>
              </div></td>}
            </tr>)}</tbody>
          </table>
        </div>
        <div className="pagination">
          <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, result.total)} of {result.total}</span>
          <div>
            <button className="button button-secondary" disabled={loading || page <= 1} onClick={() => { setLoading(true); setPage((current) => current - 1); }}>Previous</button>
            <button className="button button-secondary" disabled={loading || page >= result.totalPages} onClick={() => { setLoading(true); setPage((current) => current + 1); }}>Next</button>
          </div>
        </div>
      </> : <EmptyState>No expenses match your filters. Record an expense to start tracking costs.</EmptyState>}
    </section>
  </>;
}
