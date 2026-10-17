import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { apiRequest } from './api';
import { money, shortDate, dateInputToday } from './format';
import type { Category, Product, Report } from './types';
import { Button, Card, Empty, Field, Notice, Page, Row, SectionTitle, SelectField, Stat } from './ui';

type Period = 'daily' | 'weekly' | 'monthly' | 'summary';

export function ReportsScreen() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [date, setDate] = useState(dateInputToday());
  const [from, setFrom] = useState(`${dateInputToday().slice(0, 8)}01`);
  const [to, setTo] = useState(dateInputToday());
  const [categoryId, setCategoryId] = useState('');
  const [productId, setProductId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([apiRequest<Category[]>('/categories'), apiRequest<Product[]>('/products')])
      .then(([categoryList, productList]) => { setCategories(categoryList); setProducts(productList); })
      .catch((cause: Error) => setError(cause.message));
    const params = new URLSearchParams({ date: dateInputToday() });
    apiRequest<Report>(`/reports/monthly?${params}`)
      .then(setReport)
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  async function runReport() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (period === 'summary') {
        if (!from || !to) throw new Error('Select both dates for a date-range report.');
        params.set('from', from);
        params.set('to', to);
      } else params.set('date', date);
      if (categoryId) params.set('categoryId', categoryId);
      if (productId) params.set('productId', productId);
      setReport(await apiRequest<Report>(`/reports/${period}?${params}`));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load this report.');
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter((product) =>
    !categoryId || (typeof product.category !== 'string' && product.category._id === categoryId),
  );

  return (
    <Page title="Reports" subtitle="Review sales, profit, and stock for a selected period.">
      {error ? <Notice>{error}</Notice> : null}
      <Card>
        <SelectField label="Reporting period" value={period} options={[
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' },
          { label: 'Date range', value: 'summary' },
        ]} onChange={(value) => setPeriod(value as Period)} />
        {period === 'summary' ? <View style={{ gap: 8 }}>
          <Field label="From (YYYY-MM-DD)" value={from} onChangeText={setFrom} />
          <Field label="To (YYYY-MM-DD)" value={to} onChangeText={setTo} />
        </View> : <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />}
        <SelectField label="Category filter" value={categoryId} options={[
          { label: 'All categories', value: '' },
          ...categories.map((category) => ({ label: category.name, value: category._id })),
        ]} onChange={(value) => { setCategoryId(value); setProductId(''); }} />
        <SelectField label="Product filter" value={productId} options={[
          { label: 'All products', value: '' },
          ...filteredProducts.map((product) => ({ label: product.name, value: product._id })),
        ]} onChange={setProductId} />
        <Button title={loading ? 'Loading…' : 'Run report'} onPress={() => void runReport()} disabled={loading} />
      </Card>
      {report ? <>
        <Card><Row title="Period" detail={`${shortDate(report.period.from)} – ${shortDate(report.period.to)}`} /></Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
          <Stat label="Sales total" value={loading ? '—' : money(report.total)} />
          <Stat label="Units sold" value={loading ? '—' : String(report.productsSold)} accent="#8067d7" />
          <Stat label="Estimated profit" value={loading ? '—' : money(report.estimatedProfit)} accent="#188b67" />
          <Stat label="Current stock" value={loading ? '—' : String(report.currentStock)} accent="#d88b35" />
        </View>
        <Card>
          <SectionTitle>Sales breakdown</SectionTitle>
          <Row title="Subtotal" right={money(report.salesSubtotal)} />
          <Row title="VAT" right={money(report.vat)} />
          <Row title="Collected" right={money(report.totalCollected)} />
          <Row title="Pending" right={money(report.totalDue)} />
          <Row title="Cost of goods sold" right={`− ${money(report.costOfGoodsSold)}`} />
          <Row title="Expenses" right={`− ${money(report.expenses)}`} />
          <Row title="Gross profit" right={money(report.grossProfit)} />
        </Card>
        <Card>
          <SectionTitle>Best-selling products</SectionTitle>
          {report.bestSellingProducts.length ? report.bestSellingProducts.slice(0, 10).map((item, index) => (
            <Row key={item.productId} title={`${index + 1}. ${item.productName}`} right={`${item.quantity} units`} />
          )) : <Empty>No product sales in this period.</Empty>}
        </Card>
        <Card>
          <SectionTitle>Low stock</SectionTitle>
          {report.lowStockProducts.length ? report.lowStockProducts.slice(0, 10).map((item) => (
            <Row key={`${item.productId}-${item.sku}`} title={item.productName} detail={`${item.sku} · threshold ${item.lowStockThreshold}`} right={`${item.quantity} left`} />
          )) : <Empty>No low-stock products.</Empty>}
        </Card>
        <Card>
          <SectionTitle>Recent sales</SectionTitle>
          {report.recentSales.length ? report.recentSales.map((sale) => (
            <Row key={sale.id} title={sale.saleReference} detail={`${shortDate(sale.saleDate)} · ${sale.paymentStatus}`} right={money(sale.total)} />
          )) : <Empty>No sales in this period.</Empty>}
        </Card>
      </> : <Card><Empty>{loading ? 'Loading report…' : 'Run a report to see results.'}</Empty></Card>}
    </Page>
  );
}
