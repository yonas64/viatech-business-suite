import { useEffect, useState } from 'react';
import { Alert, Linking, Modal, Text, View } from 'react-native';
import { apiRequest, jsonBody } from './api';
import { dateInputToday, money, shortDate } from './format';
import type { Expense, FinanceSummary, PageResult } from './types';
import { Button, Card, Empty, Field, Notice, Page, Row, SectionTitle, Stat, colors } from './ui';

export function FinanceScreen({ onExpenses }: { onExpenses: () => void }) {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(start = from, end = to) {
    setLoading(true);
    setError('');
    try {
      const query = start && end ? `?from=${encodeURIComponent(start)}&to=${encodeURIComponent(end)}` : '';
      setSummary(await apiRequest<FinanceSummary>(`/finance/summary${query}`));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load finance summary.'); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    apiRequest<FinanceSummary>('/finance/summary')
      .then(setSummary)
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Page title="Finance" subtitle="Business performance, collected payments, and margins.">
      {error ? <Notice>{error}</Notice> : null}
      <Card>
        <SectionTitle>Financial period</SectionTitle>
        <Field label="From (YYYY-MM-DD)" value={from} onChangeText={setFrom} placeholder="Optional" />
        <Field label="To (YYYY-MM-DD)" value={to} onChangeText={setTo} placeholder="Optional" />
        {Boolean(from) !== Boolean(to) ? <Notice>Choose both start and end dates.</Notice> : null}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="Apply" onPress={() => void load()} disabled={Boolean(from) !== Boolean(to)} />
          <Button title="Clear" secondary onPress={() => { setFrom(''); setTo(''); void load('', ''); }} />
        </View>
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
        <Stat label="Sales revenue" value={loading ? '—' : money(summary?.totalSales)} />
        <Stat label="Collected" value={loading ? '—' : money(summary?.totalCollected)} accent="#188b67" />
        <Stat label="Outstanding" value={loading ? '—' : money(summary?.totalDue)} accent="#d88b35" />
        <Stat label="Estimated profit" value={loading ? '—' : money(summary?.estimatedProfit)} accent="#8067d7" />
      </View>
      <Card>
        <SectionTitle>Profit breakdown</SectionTitle>
        <Row title="Sales before VAT" right={money(summary?.salesSubtotal)} />
        <Row title="VAT collected" right={money(summary?.totalVat)} />
        <Row title="Cost of goods sold" right={`− ${money(summary?.costOfGoodsSold)}`} />
        <Row title="Operating expenses" right={`− ${money(summary?.expenses)}`} />
        <Row title="Estimated profit" right={money(summary?.estimatedProfit)} />
      </Card>
      <Card>
        <SectionTitle>Inventory value</SectionTitle>
        <Row title="Current cost value" right={money(summary?.currentInventoryCost)} />
        <Row title="Expected profit on stock" right={money(summary?.expectedProfit)} />
      </Card>
      <Button title="Open expense register" secondary onPress={onExpenses} />
    </Page>
  );
}

type ExpenseDraft = {
  category: string;
  amount: string;
  expenseDate: string;
  description: string;
  reference: string;
  receiptUrl: string;
};

function emptyExpense(): ExpenseDraft {
  return { category: '', amount: '', expenseDate: dateInputToday(), description: '', reference: '', receiptUrl: '' };
}

const EXPENSE_LIMIT = 20;

export function ExpensesScreen({ isAdmin }: { isAdmin: boolean }) {
  const [result, setResult] = useState<PageResult<Expense> | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState('');
  const [filters, setFilters] = useState({ from: '', to: '', category: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [draft, setDraft] = useState<ExpenseDraft>(emptyExpense());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(EXPENSE_LIMIT) });
    if (filters.from) params.set('from', new Date(`${filters.from}T00:00:00.000Z`).toISOString());
    if (filters.to) params.set('to', new Date(`${filters.to}T23:59:59.999Z`).toISOString());
    if (filters.category) params.set('category', filters.category);
    apiRequest<PageResult<Expense>>(`/expenses?${params}`)
      .then(setResult)
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, [page, filters]);

  function applyFilters() {
    if (Boolean(from) !== Boolean(to)) {
      setError('Choose both start and end dates.');
      return;
    }
    setError('');
    setLoading(true);
    setPage(1);
    setFilters({ from, to, category: category.trim() });
  }

  function openCreate() {
    setEditing(null);
    setDraft(emptyExpense());
    setError('');
    setEditor(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setDraft({
      category: expense.category,
      amount: String(expense.amount),
      expenseDate: new Date(expense.expenseDate).toISOString().slice(0, 10),
      description: expense.description,
      reference: expense.reference ?? '',
      receiptUrl: expense.receiptUrl ?? '',
    });
    setError('');
    setEditor(true);
  }

  async function saveExpense() {
    if (!draft.category.trim() || !draft.description.trim() || !Number(draft.amount) || !draft.expenseDate) {
      setError('Category, amount, date, and description are required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const payload = {
        ...draft,
        category: draft.category.trim(),
        amount: Number(draft.amount),
        expenseDate: new Date(`${draft.expenseDate}T12:00:00`).toISOString(),
        reference: draft.reference.trim(),
        receiptUrl: draft.receiptUrl.trim() || undefined,
      };
      await apiRequest(editing ? `/expenses/${editing._id}` : '/expenses', {
        method: editing ? 'PATCH' : 'POST',
        body: jsonBody(payload),
      });
      setEditor(false);
      setLoading(true);
      setPage(1);
      setFilters((current) => ({ ...current }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save expense.'); }
    finally { setBusy(false); }
  }

  function remove(expense: Expense) {
    Alert.alert('Delete expense?', `Delete "${expense.description}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        void apiRequest(`/expenses/${expense._id}`, { method: 'DELETE' })
          .then(() => { setLoading(true); setFilters((current) => ({ ...current })); })
          .catch((cause: Error) => setError(cause.message));
      } },
    ]);
  }

  return (
    <Page title="Expenses" subtitle="Operating costs included in your profit reports."
      action={isAdmin ? <Button title="+ Record" onPress={openCreate} small /> : undefined}>
      {error ? <Notice>{error}</Notice> : null}
      <View style={{ flexDirection: 'row', gap: 9 }}>
        <Stat label="Expenses" value={loading ? '—' : String(result?.total ?? 0)} />
        <Stat label="Total amount" value={loading ? '—' : money(result?.amount)} accent="#d88b35" />
      </View>
      <Card>
        <SectionTitle>Filter expenses</SectionTitle>
        <Field label="From date" value={from} onChangeText={setFrom} placeholder="YYYY-MM-DD" />
        <Field label="To date" value={to} onChangeText={setTo} placeholder="YYYY-MM-DD" />
        <Field label="Category" value={category} onChangeText={setCategory} placeholder="e.g. rent" />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="Apply filters" onPress={applyFilters} />
          <Button title="Clear" secondary onPress={() => {
            setFrom(''); setTo(''); setCategory(''); setPage(1); setLoading(true);
            setFilters({ from: '', to: '', category: '' });
          }} />
        </View>
      </Card>
      <Card>
        <SectionTitle>Expense register</SectionTitle>
        {loading ? <Empty>Loading expenses…</Empty> : result?.items.length ? result.items.map((expense) => (
          <View key={expense._id} style={{ gap: 6, borderBottomWidth: 1, borderBottomColor: '#eef1f5', paddingBottom: 11 }}>
            <Row title={expense.description} detail={`${expense.category} · ${shortDate(expense.expenseDate)}${expense.reference ? ` · Ref: ${expense.reference}` : ''}`} right={money(expense.amount)} />
            {expense.receiptUrl ? <Button title="Open receipt" secondary small onPress={() => {
              void Linking.openURL(expense.receiptUrl!).catch(() => setError('Unable to open this receipt link.'));
            }} /> : null}
            {isAdmin ? <View style={{ flexDirection: 'row', gap: 7 }}>
              <Button title="Edit" secondary small onPress={() => openEdit(expense)} />
              <Button title="Delete" danger small onPress={() => remove(expense)} />
            </View> : null}
          </View>
        )) : <Empty>No expenses match your filters.</Empty>}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <Button title="Previous" secondary small disabled={page <= 1 || loading} onPress={() => { setLoading(true); setPage((current) => current - 1); }} />
          <Text style={{ color: colors.muted, fontSize: 10 }}>{page} / {Math.max(result?.totalPages ?? 1, 1)}</Text>
          <Button title="Next" secondary small disabled={page >= (result?.totalPages ?? 1) || loading} onPress={() => { setLoading(true); setPage((current) => current + 1); }} />
        </View>
      </Card>
      <Modal visible={editor} animationType="slide" onRequestClose={() => setEditor(false)}>
        <Page title={editing ? 'Edit expense' : 'Record expense'} subtitle="Keep business costs and profit calculations up to date.">
          {error ? <Notice>{error}</Notice> : null}
          <Field label="Category" value={draft.category} onChangeText={(category) => setDraft({ ...draft, category })} placeholder="Rent, utilities, supplies…" required />
          <Field label="Amount" value={draft.amount} onChangeText={(amount) => setDraft({ ...draft, amount })} keyboardType="decimal-pad" required />
          <Field label="Date (YYYY-MM-DD)" value={draft.expenseDate} onChangeText={(expenseDate) => setDraft({ ...draft, expenseDate })} required />
          <Field label="Description" value={draft.description} onChangeText={(description) => setDraft({ ...draft, description })} required />
          <Field label="Reference (optional)" value={draft.reference} onChangeText={(reference) => setDraft({ ...draft, reference })} />
          <Field label="Receipt URL (optional)" value={draft.receiptUrl} onChangeText={(receiptUrl) => setDraft({ ...draft, receiptUrl })} autoCapitalize="none" />
          <Button title={busy ? 'Saving…' : editing ? 'Save changes' : 'Save expense'} onPress={() => void saveExpense()} disabled={busy} />
          <Button title="Cancel" secondary onPress={() => setEditor(false)} />
        </Page>
      </Modal>
    </Page>
  );
}
