import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { apiRequest } from './api';
import { money, shortDate } from './format';
import type { FinanceSummary, Product, Sale, StockItem, User } from './types';
import { Button, Card, Empty, Notice, Page, Row, SectionTitle, Stat } from './ui';

export function DashboardScreen({
  user,
  onNavigate,
}: {
  user: User;
  onNavigate: (screen: string) => void;
}) {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
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
      .then(([finance, saleList, productList, stockList]) => {
        setSummary(finance);
        setSales(saleList);
        setProducts(productList);
        setLowStock(stockList);
      })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Page title={`Hello, ${user.name.split(' ')[0]}`} subtitle="Here’s your business overview.">
      {error ? <Notice>{error}</Notice> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
        <Stat label="Sales" value={loading ? '—' : money(summary?.totalSales)} />
        <Stat label="Estimated profit" value={loading ? '—' : money(summary?.estimatedProfit)} accent="#188b67" />
        <Stat label="Products" value={loading ? '—' : String(summary?.productsTracked ?? 0)} accent="#8067d7" />
        <Stat label="Low stock" value={loading ? '—' : String(lowStock.length)} accent="#d88b35" />
      </View>
      <Card>
        <SectionTitle>Recent sales</SectionTitle>
        {sales.length ? sales.slice(0, 5).map((sale) => (
          <Row key={sale._id} title={sale.saleReference} detail={`${shortDate(sale.saleDate)} · ${sale.paymentStatus}`} right={money(sale.total)} />
        )) : <Empty>{loading ? 'Loading sales…' : 'No sales have been recorded yet.'}</Empty>}
        <Button title="Open sales" secondary small onPress={() => onNavigate('Sales')} />
      </Card>
      <Card>
        <SectionTitle>Stock watch</SectionTitle>
        {lowStock.length ? lowStock.slice(0, 5).map((item) => (
          <Row key={`${item.productId}-${item.variantId}`} title={item.productName} detail={item.sku} right={`${item.quantity} ${item.unit ?? 'pcs'}`} />
        )) : <Empty>{loading ? 'Checking stock…' : 'All products are above their stock thresholds.'}</Empty>}
        <Button title="Review inventory" secondary small onPress={() => onNavigate('Inventory')} />
      </Card>
      <Card>
        <SectionTitle>Quick actions</SectionTitle>
        <Button title="Create a sale" onPress={() => onNavigate('Sales')} />
        {user.role === 'admin' ? <Button title="Add a product" secondary onPress={() => onNavigate('Products')} /> : null}
        <TextVariantCount productCount={products.length} />
      </Card>
    </Page>
  );
}

function TextVariantCount({ productCount }: { productCount: number }) {
  return <View><Empty>{productCount} products currently active in your catalog.</Empty></View>;
}
