"use client";

import { useEffect, useState, type FormEvent } from 'react';
import { apiRequest, jsonBody } from '@/lib/api/config';
import { shortDate, variantLabel } from '@/lib/format';
import type { Product, StockItem } from '@/lib/types';
import { useCurrentUser } from '@/components/auth-context';
import { EmptyState, Notice, PageHeading, SectionTitle, StatCard } from '@/components/ui';

type Movement = {
  _id: string;
  product?: Product | string;
  variantId: string;
  movementType: string;
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  reason: string;
  createdAt: string;
  createdBy?: { name?: string };
};

export default function InventoryPage() {
  const user = useCurrentUser();
  const [stock, setStock] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState('');
  const [kind, setKind] = useState<'add' | 'remove' | 'adjust'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const [stockResult, productsResult, movementResult] = await Promise.all([
        apiRequest<StockItem[]>('/inventory/stock'),
        apiRequest<Product[]>('/products'),
        apiRequest<{ items: Movement[] }>('/inventory/movements?limit=8'),
      ]);
      setStock(stockResult);
      setProducts(productsResult);
      setMovements(movementResult.items);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load inventory.'); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    Promise.all([
      apiRequest<StockItem[]>('/inventory/stock'),
      apiRequest<Product[]>('/products'),
      apiRequest<{ items: Movement[] }>('/inventory/movements?limit=8'),
    ])
      .then(([stockResult, productsResult, movementResult]) => {
        setStock(stockResult);
        setProducts(productsResult);
        setMovements(movementResult.items);
      })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  const totalUnits = stock.reduce((sum, item) => sum + item.quantity, 0);
  const selectedParts = selected.split(':');

  async function submitMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const [productId, variantId] = selectedParts;
    setBusy(true);
    setError('');
    try {
      const path = kind === 'add' ? '/inventory/stock/add' : kind === 'remove' ? '/inventory/stock/remove' : '/inventory/stock/adjust';
      await apiRequest(path, {
        method: 'POST',
        body: jsonBody({ productId, variantId, quantity: Number(quantity), reason }),
      });
      setQuantity('');
      setReason('');
      setShowForm(false);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not update stock.'); }
    finally { setBusy(false); }
  }

  return <>
    <PageHeading eyebrow="OPERATIONS" title="Inventory" description="Keep track of what is on hand and every stock change."
      action={user?.role === 'admin' && <button className="button button-primary" onClick={() => setShowForm(!showForm)}><span>＋</span> Update stock</button>} />
    {error && <Notice>{error}</Notice>}
    <div className="stats-grid stats-three">
      <StatCard label="Total units on hand" value={loading ? '—' : totalUnits.toLocaleString()} note="Across active product variants" />
      <StatCard label="Tracked variants" value={loading ? '—' : stock.length} note="Active stock-keeping units" tone="purple" />
      <StatCard label="Need restocking" value={loading ? '—' : stock.filter((item) => item.isLowStock).length} note="At or below threshold" tone="orange" />
    </div>
    {showForm && user?.role === 'admin' && <section className="panel form-panel">
      <SectionTitle title="Record a stock movement" description="All changes are saved to your inventory movement history." />
      <form className="form-grid" onSubmit={submitMovement}>
        <label className="span-two">Product / variant<select required value={selected} onChange={(event) => setSelected(event.target.value)}>
          <option value="">Select a product variant</option>
          {products.flatMap((product) => product.variants.map((variant) => <option key={`${product._id}:${variant._id}`} value={`${product._id}:${variant._id}`}>{product.name} · {variantLabel(variant)} · {variant.quantity} {variant.unit ?? 'pcs'}</option>))}
        </select></label>
        <label>Movement<select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}><option value="add">Add stock</option><option value="remove">Remove stock</option><option value="adjust">Set counted quantity</option></select></label>
        <label>{kind === 'adjust' ? 'Counted quantity' : 'Quantity'}<input required type="number" min="0" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
        <label className="span-two">Reason<input required value={reason} onChange={(event) => setReason(event.target.value)} placeholder="e.g. Supplier delivery, damaged goods, stock count" /></label>
        <div className="form-actions span-two"><button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="button button-primary" disabled={busy || !selected}>{busy ? 'Saving…' : 'Save movement'}</button></div>
      </form>
    </section>}
    <section className="panel">
      <SectionTitle title="Current stock" description="Stock levels are calculated from your active product variants." />
      {loading ? <div className="loading-state">Loading stock…</div> : stock.length ? <div className="table-wrap">
        <table><thead><tr><th>Product</th><th>SKU</th><th>Variant</th><th>Available</th><th>Threshold</th><th>Status</th></tr></thead>
          <tbody>{stock.map((item) => <tr key={`${item.productId}-${item.variantId}`}>
            <td><strong>{item.productName}</strong></td><td>{item.sku}</td><td>{item.specification || item.sku}</td>
            <td><strong>{item.quantity}</strong> {item.unit ?? 'pcs'}</td><td>{item.lowStockThreshold}</td>
            <td><span className={`status ${item.isLowStock ? 'status-pending' : 'status-paid'}`}>{item.isLowStock ? 'Low stock' : 'Healthy'}</span></td>
          </tr>)}</tbody>
        </table>
      </div> : <EmptyState>No stock to display yet. Add products with variants to get started.</EmptyState>}
    </section>
    <section className="panel">
      <SectionTitle title="Movement history" description="A running audit of inventory changes." />
      {movements.length ? <div className="table-wrap"><table>
        <thead><tr><th>Date</th><th>Product</th><th>Movement</th><th>Change</th><th>Reason</th><th>Recorded by</th></tr></thead>
        <tbody>{movements.map((movement) => <tr key={movement._id}>
          <td>{shortDate(movement.createdAt)}</td>
          <td><strong>{typeof movement.product === 'object' ? movement.product.name : 'Product'}</strong></td>
          <td><span className={`status ${movement.movementType === 'in' ? 'status-paid' : 'status-pending'}`}>{movement.movementType}</span></td>
          <td>{movement.beforeQuantity} → <strong>{movement.afterQuantity}</strong></td><td>{movement.reason}</td><td>{movement.createdBy?.name ?? '—'}</td>
        </tr>)}</tbody>
      </table></div> : !loading && <EmptyState>Stock movements will appear here.</EmptyState>}
    </section>
  </>;
}
