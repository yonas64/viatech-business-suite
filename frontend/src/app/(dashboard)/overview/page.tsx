"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api/config';
import { money, shortDate } from '@/lib/format';
import type { FinanceSummary, Product, Sale, StockItem } from '@/lib/types';
import { EmptyState, Notice, PageHeading, StatCard } from '@/components/ui';

export default function DashboardOverviewPage() {
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<StockItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest<FinanceSummary>('/finance/summary'),
      apiRequest<Sale[]>('/sales'),
      apiRequest<Product[]>('/products'),
      apiRequest<StockItem[]>('/inventory/low-stock'),
    ])
      .then(([financeData, salesData, productData, stockData]) => {
        setFinance(financeData);
        setSales(salesData);
        setProducts(productData);
        setLowStock(stockData);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeading
        eyebrow="YOUR BUSINESS AT A GLANCE"
        title="Good business starts here."
        description="A clear view of your sales, stock, and business performance."
        action={<Link href="/sales" className="button button-primary"><span>＋</span> New sale</Link>}
      />
      {error && <Notice>{error} Make sure the backend is running and try refreshing.</Notice>}
      <div className="stats-grid">
        <StatCard label="Total sales" value={loading ? '—' : money(finance?.totalSales)} note={`${finance?.transactionCount ?? 0} transactions`} tone="blue" />
        <StatCard label="Estimated profit" value={loading ? '—' : money(finance?.estimatedProfit)} note="After expenses" tone="green" />
        <StatCard label="Products tracked" value={loading ? '—' : finance?.productsTracked ?? 0} note={`${products.reduce((sum, product) => sum + product.variants.length, 0)} variants`} tone="purple" />
        <StatCard label="Low stock items" value={loading ? '—' : lowStock.length} note="Need attention" tone="orange" />
      </div>
      <div className="dashboard-grid">
        <section className="panel recent-panel">
          <div className="section-title">
            <div><h2>Recent sales</h2><p>Your latest transactions</p></div>
            <Link className="text-link" href="/sales">View all <span>→</span></Link>
          </div>
          {sales.length ? (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Reference</th><th>Date</th><th>Payment</th><th className="align-right">Total</th></tr></thead>
                <tbody>{sales.slice(0, 5).map((sale) => (
                  <tr key={sale._id}>
                    <td><strong>{sale.saleReference}</strong></td>
                    <td>{shortDate(sale.saleDate)}</td>
                    <td><span className={`status status-${sale.paymentStatus}`}>{sale.paymentStatus}</span></td>
                    <td className="align-right"><strong>{money(sale.total)}</strong></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <EmptyState>{loading ? 'Loading recent sales…' : 'Your sales will appear here.'}</EmptyState>}
        </section>
        <section className="panel stock-panel">
          <div className="section-title">
            <div><h2>Stock watch</h2><p>Products below their threshold</p></div>
            <Link className="text-link" href="/inventory">Inventory <span>→</span></Link>
          </div>
          {lowStock.length ? (
            <div className="stock-list">
              {lowStock.slice(0, 5).map((item) => (
                <div className="stock-row" key={`${item.productId}-${item.variantId}`}>
                  <span className="stock-avatar">{item.productName.slice(0, 1).toUpperCase()}</span>
                  <span className="stock-name"><strong>{item.productName}</strong><small>{item.sku}</small></span>
                  <span className="stock-amount">{item.quantity} <small>{item.unit ?? 'pcs'}</small></span>
                </div>
              ))}
            </div>
          ) : <EmptyState>{loading ? 'Checking stock…' : 'Everything is well stocked.'}</EmptyState>}
        </section>
      </div>
      <section className="quick-actions">
        <div><div className="eyebrow">QUICK ACCESS</div><h2>Where to next?</h2></div>
        <div className="quick-links">
          <Link href="/products"><span>▦</span> Manage products <b>→</b></Link>
          <Link href="/inventory"><span>▤</span> Update stock <b>→</b></Link>
          <Link href="/finance"><span>$</span> Review finances <b>→</b></Link>
        </div>
      </section>
    </>
  );
}
