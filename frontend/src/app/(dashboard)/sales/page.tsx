"use client";

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { apiRequest, jsonBody } from '@/lib/api/config';
import { money, shortDate, variantLabel } from '@/lib/format';
import type { Product, Sale } from '@/lib/types';
import { EmptyState, Notice, PageHeading, SectionTitle, StatCard } from '@/components/ui';

type CartLine = { selection: string; quantity: number };

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lines, setLines] = useState<CartLine[]>([{ selection: '', quantity: 1 }]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [salesResult, productResult] = await Promise.all([
        apiRequest<Sale[]>('/sales'),
        apiRequest<Product[]>('/products'),
      ]);
      setSales(salesResult);
      setProducts(productResult);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load sales.'); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    Promise.all([
      apiRequest<Sale[]>('/sales'),
      apiRequest<Product[]>('/products'),
    ])
      .then(([salesResult, productResult]) => {
        setSales(salesResult);
        setProducts(productResult);
      })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  const options = useMemo(() => products.flatMap((product) => product.variants.map((variant) => ({
    key: `${product._id}:${variant._id}`,
    product,
    variant,
  }))).filter(({ variant }) => variant.quantity > 0), [products]);
  const selectedItems = lines.map((line) => {
    const option = options.find((item) => item.key === line.selection);
    return option ? { ...option, quantity: line.quantity } : null;
  }).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const subtotal = selectedItems.reduce((sum, item) => sum + item.variant.sellingPrice * item.quantity, 0);
  const vat = selectedItems.reduce((sum, item) => sum + item.variant.sellingPrice * item.quantity * (item.variant.vatRate ?? 0.15), 0);
  const total = subtotal + vat;

  async function createSale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await apiRequest('/sales', {
        method: 'POST',
        body: jsonBody({
          items: selectedItems.map(({ product, variant, quantity }) => ({
            productId: product._id,
            variantId: variant._id,
            quantity,
          })),
          paymentMethod,
          paymentStatus,
        }),
      });
      setLines([{ selection: '', quantity: 1 }]);
      setShowForm(false);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not record sale.'); }
    finally { setBusy(false); }
  }

  return <>
    <PageHeading eyebrow="REVENUE" title="Sales" description="Record a sale and keep every transaction easy to find."
      action={<button className="button button-primary" onClick={() => setShowForm(!showForm)}><span>＋</span> New sale</button>} />
    {error && <Notice>{error}</Notice>}
    <div className="stats-grid stats-three">
      <StatCard label="Sales recorded" value={loading ? '—' : sales.length} note="All-time transactions" />
      <StatCard label="Sales total" value={loading ? '—' : money(sales.reduce((sum, sale) => sum + sale.total, 0))} note="Including VAT" tone="green" />
      <StatCard label="Pending payments" value={loading ? '—' : money(sales.filter((sale) => sale.paymentStatus === 'pending').reduce((sum, sale) => sum + sale.total, 0))} note={`${sales.filter((sale) => sale.paymentStatus === 'pending').length} transactions`} tone="orange" />
    </div>
    {showForm && <section className="panel form-panel">
      <SectionTitle title="Create a sale" description="Choose products and quantities. Prices and VAT are taken from your catalog." />
      {!options.length ? <Notice kind="info">Add an active product with available stock before recording sales.</Notice> : <form className="sale-form" onSubmit={createSale}>
        {lines.map((line, index) => <div className="sale-line" key={index}>
          <label className="sale-product-field">Product / variant<select required value={line.selection} onChange={(event) => setLines(lines.map((item, i) => i === index ? { ...item, selection: event.target.value } : item))}>
            <option value="">Choose a product</option>
            {options.map(({ key, product, variant }) => <option key={key} value={key}>{product.name} · {variantLabel(variant, typeof product.category === 'string' ? [] : product.category.specificationFields)} · {variant.quantity} available</option>)}
          </select></label>
          <label className="sale-quantity-field">Qty<input required type="number" min="1" step="1" value={line.quantity} onChange={(event) => setLines(lines.map((item, i) => i === index ? { ...item, quantity: Number(event.target.value) } : item))} /></label>
          {lines.length > 1 && <button type="button" className="icon-button danger-button line-remove" onClick={() => setLines(lines.filter((_, i) => i !== index))} aria-label="Remove line">×</button>}
        </div>)}
        <button type="button" className="text-button" onClick={() => setLines([...lines, { selection: '', quantity: 1 }])}>＋ Add another item</button>
        <div className="sale-bottom">
          <div className="sale-options">
            <label>Payment method<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="cash">Cash</option><option value="card">Card</option><option value="bank-transfer">Bank transfer</option><option value="other">Other</option></select></label>
            <label>Payment status<select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as typeof paymentStatus)}><option value="paid">Paid</option><option value="pending">Pending</option></select></label>
          </div>
          <div className="sale-total"><span>Subtotal <b>{money(subtotal)}</b></span><span>Estimated VAT <b>{money(vat)}</b></span><strong>Total <b>{money(total)}</b></strong></div>
        </div>
        <div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="button button-primary" disabled={busy || !selectedItems.length}>{busy ? 'Recording…' : 'Complete sale'}</button></div>
      </form>}
    </section>}
    <section className="panel">
      <SectionTitle title="Transaction history" description="Sales are listed with the payment status and cashier details." />
      {loading ? <div className="loading-state">Loading transactions…</div> : sales.length ? <div className="table-wrap">
        <table><thead><tr><th>Reference</th><th>Date</th><th>Items</th><th>Payment</th><th>Status</th><th className="align-right">Total</th></tr></thead>
          <tbody>{sales.map((sale) => <tr key={sale._id}>
            <td><strong>{sale.saleReference}</strong></td><td>{shortDate(sale.saleDate)}</td>
            <td>{sale.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)<small className="table-subtitle">{sale.items.map((item) => item.productName).join(', ')}</small></td>
            <td className="capitalize">{sale.paymentMethod.replace('-', ' ')}</td>
            <td><span className={`status status-${sale.paymentStatus}`}>{sale.paymentStatus}</span></td>
            <td className="align-right"><strong>{money(sale.total)}</strong></td>
          </tr>)}</tbody>
        </table>
      </div> : <EmptyState>No sales yet. Record your first transaction.</EmptyState>}
    </section>
  </>;
}
