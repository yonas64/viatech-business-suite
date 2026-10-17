"use client";

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api/config';
import { money, shortDate } from '@/lib/format';
import type { Category, Product } from '@/lib/types';
import { EmptyState, Notice, PageHeading, SectionTitle, StatCard } from '@/components/ui';

type ReportData = {
  period: { from: string; to: string };
  salesCount: number;
  productsSold: number;
  salesSubtotal: number;
  vat: number;
  total: number;
  totalCollected: number;
  totalDue: number;
  costOfGoodsSold: number;
  expenses: number;
  grossProfit: number;
  estimatedProfit: number;
  currentStock: number;
  bestSellingProducts: { productId: string; productName: string; quantity: number }[];
  lowStockProducts: { productId: string; productName: string; sku: string; quantity: number; lowStockThreshold: number }[];
  recentSales: { id: string; saleReference: string; saleDate: string; total: number; paymentStatus: string }[];
  recentStockMovements: { _id: string; movementType: string; quantity: number; createdAt: string }[];
};

function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'summary'>('monthly');
  const [date, setDate] = useState(localToday());
  const [from, setFrom] = useState(localToday().slice(0, 8) + '01');
  const [to, setTo] = useState(localToday());
  const [categoryId, setCategoryId] = useState('');
  const [productId, setProductId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiRequest<Category[]>('/categories'),
      apiRequest<Product[]>('/products'),
    ]).then(([categoryList, productList]) => {
      setCategories(categoryList);
      setProducts(productList);
    }).catch((cause: Error) => setError(cause.message));
  }, []);

  async function loadReport(nextPeriod = period) {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams();
      if (nextPeriod === 'summary') {
        query.set('from', from);
        query.set('to', to);
      } else query.set('date', date);
      if (categoryId) query.set('categoryId', categoryId);
      if (productId) query.set('productId', productId);
      const data = await apiRequest<ReportData>(`/reports/${nextPeriod}?${query.toString()}`);
      setReport(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not create report.'); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const query = new URLSearchParams({ date: localToday() });
    apiRequest<ReportData>(`/reports/monthly?${query.toString()}`)
      .then(setReport)
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  const productOptions = products.filter((product) => !categoryId || (typeof product.category !== 'string' && product.category?._id === categoryId));

  return <>
    <PageHeading eyebrow="INSIGHTS" title="Reports" description="Explore sales performance, stock health, and business trends." />
    {error && <Notice>{error}</Notice>}
    <section className="panel report-filter-panel">
      <div className="period-tabs" role="tablist" aria-label="Report period">
        {(['daily', 'weekly', 'monthly', 'summary'] as const).map((item) => <button key={item} className={period === item ? 'period-active' : ''} onClick={() => setPeriod(item)}>{item === 'summary' ? 'Date range' : item}</button>)}
      </div>
      <form className="report-controls" onSubmit={(event) => { event.preventDefault(); void loadReport(period); }}>
        {period === 'summary' ? <>
          <label>From<input required type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} /></label>
          <label>To<input required type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} /></label>
        </> : <label>Report date<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>}
        <label>Category<select value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setProductId(''); }}><option value="">All categories</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>
        <label>Product<select value={productId} onChange={(event) => setProductId(event.target.value)}><option value="">All products</option>{productOptions.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}</select></label>
        <button className="button button-primary" disabled={loading}>{loading ? 'Loading…' : 'Run report'} <span>→</span></button>
      </form>
    </section>
    {report && <>
      <div className="report-period"><span className="period-indicator" /> Report period <strong>{shortDate(report.period.from)} – {shortDate(report.period.to)}</strong></div>
      <div className="stats-grid">
        <StatCard label="Sales total" value={loading ? '—' : money(report.total)} note={`${report.salesCount} transactions`} />
        <StatCard label="Products sold" value={loading ? '—' : report.productsSold} note="Units sold in period" tone="purple" />
        <StatCard label="Estimated profit" value={loading ? '—' : money(report.estimatedProfit)} note="After expenses" tone="green" />
        <StatCard label="Current stock" value={loading ? '—' : report.currentStock.toLocaleString()} note="Units currently on hand" tone="orange" />
      </div>
      <div className="dashboard-grid report-grid">
        <section className="panel"><SectionTitle title="Sales overview" description="Revenue and payment status for this period." />
          <div className="breakdown-list report-breakdown">
            <div><span>Subtotal</span><strong>{money(report.salesSubtotal)}</strong></div>
            <div><span>VAT</span><strong>{money(report.vat)}</strong></div>
            <div><span>Payments collected</span><strong>{money(report.totalCollected)}</strong></div>
            <div><span>Pending payments</span><strong>{money(report.totalDue)}</strong></div>
            <div><span>Cost of goods sold</span><strong className="negative">− {money(report.costOfGoodsSold)}</strong></div>
            <div><span>Operating expenses</span><strong className="negative">− {money(report.expenses)}</strong></div>
            <div className="breakdown-total"><span>Gross profit</span><strong>{money(report.grossProfit)}</strong></div>
          </div>
        </section>
        <section className="panel"><SectionTitle title="Best-selling products" description="Ranked by quantity sold." />
          {report.bestSellingProducts.length ? <div className="rank-list">{report.bestSellingProducts.slice(0, 6).map((item, index) => <div className="rank-row" key={item.productId}>
            <span className="rank-index">{String(index + 1).padStart(2, '0')}</span><span className="rank-name">{item.productName}</span><strong>{item.quantity} <small>units</small></strong>
          </div>)}</div> : <EmptyState>No product sales in this report period.</EmptyState>}
        </section>
      </div>
      <div className="dashboard-grid report-grid">
        <section className="panel"><SectionTitle title="Low stock" description="Items at or below their configured threshold." />
          {report.lowStockProducts.length ? <div className="table-wrap"><table><thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Threshold</th></tr></thead><tbody>
            {report.lowStockProducts.slice(0, 8).map((item) => <tr key={`${item.productId}-${item.sku}`}><td><strong>{item.productName}</strong></td><td>{item.sku}</td><td><span className="quantity quantity-low">{item.quantity}</span></td><td>{item.lowStockThreshold}</td></tr>)}
          </tbody></table></div> : <EmptyState>No low-stock products. Nice work.</EmptyState>}
        </section>
        <section className="panel"><SectionTitle title="Recent sales" description="Latest transactions in this reporting period." />
          {report.recentSales.length ? <div className="report-sales-list">{report.recentSales.slice(0, 6).map((sale) => <div className="report-sale-row" key={sale.id}>
            <span className="sale-ref-mark">↗</span><span><strong>{sale.saleReference}</strong><small>{shortDate(sale.saleDate)}</small></span><strong>{money(sale.total)}</strong>
          </div>)}</div> : <EmptyState>No sales in this report period.</EmptyState>}
        </section>
      </div>
    </>}
  </>;
}
