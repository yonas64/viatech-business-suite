import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { apiRequest } from './api';
import { dateInputToday, saleSkuLabel, shortDate } from './format';
import type { Product, Report, Sale, StockItem, User } from './types';
import { Button, Card, Empty, Field, MoneyText, Notice, Page, Row, SectionTitle, SelectField, Stat, colors } from './ui';

type OverviewPeriod = 'today' | 'week' | 'month' | 'year' | 'day';

function dateValue(value: string) {
  return new Date(`${value}T12:00:00`);
}

function formatDate(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

export function DashboardScreen({
  user,
  onNavigate,
}: {
  user: User;
  onNavigate: (screen: string) => void;
}) {
  const [period, setPeriod] = useState<OverviewPeriod>('today');
  const [periodExpanded, setPeriodExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dateInputToday());
  const [showPicker, setShowPicker] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<StockItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest<Sale[]>('/sales'),
      apiRequest<Product[]>('/products'),
      apiRequest<StockItem[]>('/inventory/low-stock'),
    ])
      .then(([saleList, productList, stockList]) => {
        setSales(saleList);
        setProducts(productList);
        setLowStock(stockList);
      })
      .catch((cause: Error) => setError(cause.message));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    async function loadReport() {
      try {
        const selected = dateValue(selectedDate);
        const params = new URLSearchParams();
        let endpoint: string;
        if (period === 'today' || period === 'day') {
          endpoint = 'daily';
          params.set('date', period === 'today' ? dateInputToday() : selectedDate);
        } else if (period === 'week') {
          endpoint = 'weekly';
          params.set('date', selectedDate);
        } else if (period === 'month') {
          endpoint = 'monthly';
          params.set('date', selectedDate);
        } else {
          endpoint = 'summary';
          params.set('from', `${selected.getFullYear()}-01-01`);
          params.set('to', `${selected.getFullYear()}-12-31`);
        }
        const result = await apiRequest<Report>(`/reports/${endpoint}?${params}`);
        if (active) setReport(result);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Could not load this overview.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadReport();
    return () => { active = false; };
  }, [period, selectedDate]);

  function onDateChange(event: DateTimePickerEvent, value?: Date) {
    setShowPicker(Platform.OS === 'ios');
    if (value) setSelectedDate(formatDate(value));
  }

  const periodLabel = period === 'today'
    ? `Today · ${shortDate(dateInputToday())}`
    : period === 'day'
      ? `Selected day · ${shortDate(selectedDate)}`
      : period === 'week'
        ? `Week containing ${shortDate(selectedDate)}`
        : period === 'month'
          ? `Month containing ${shortDate(selectedDate)}`
          : `Year ${dateValue(selectedDate).getFullYear()}`;

  const reportSales = report?.recentSales.flatMap((recent) => {
    const sale = sales.find((item) => item._id === recent.id);
    return sale ? [sale] : [];
  }) ?? [];

  return (
    <Page
      title={`Hello, ${user.name.split(' ')[0]}`}
      subtitle=""
      action={
        <View style={{ gap: 7 }}>
          <Button title="+ Sale" onPress={() => onNavigate('Sales')} small />
          {user.role === 'admin' ? <Button title="+ Product" secondary onPress={() => onNavigate('Products')} small /> : null}
        </View>
      }
    >
      {error ? <Notice>{error}</Notice> : null}
      <Card>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: periodExpanded }}
          onPress={() => setPeriodExpanded((expanded) => !expanded)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
        >
          <View>
            <SectionTitle>Overview period</SectionTitle>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>{periodLabel}</Text>
          </View>
          <Text style={{ color: colors.blue, fontSize: 17, fontWeight: '800' }}>{periodExpanded ? '⌃' : '⌄'}</Text>
        </Pressable>
        {periodExpanded ? (
          <>
            <SelectField
              label="Choose a period"
              value={period}
              options={[
                { label: 'Today', value: 'today' },
                { label: 'Week', value: 'week' },
                { label: 'Month', value: 'month' },
                { label: 'Year', value: 'year' },
                { label: 'Specific day', value: 'day' },
              ]}
              onChange={(value) => {
                setPeriod(value as OverviewPeriod);
                if (value === 'day' || value === 'year' || value === 'week' || value === 'month') setShowPicker(false);
              }}
            />
            {period !== 'today' ? (
              Platform.OS === 'web' ? (
                <Field
                  label={period === 'day' ? 'Choose day (YYYY-MM-DD)' : period === 'year' ? 'Choose a date in the year' : 'Choose a date in the period'}
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <>
                  <Button
                    title={`${period === 'day' ? 'Choose day' : period === 'year' ? 'Choose year' : 'Change reference date'} · ${shortDate(selectedDate)}`}
                    secondary
                    small
                    onPress={() => setShowPicker(true)}
                  />
                  {showPicker ? (
                    <DateTimePicker
                      value={dateValue(selectedDate)}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'compact' : 'default'}
                      onChange={onDateChange}
                      maximumDate={new Date()}
                    />
                  ) : null}
                </>
              )
            ) : null}
          </>
        ) : null}
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
        <Stat label="Sales" value={loading ? '—' : <MoneyText value={report?.total} amountStyle={{ color: colors.blue }} />} onPress={() => onNavigate('Sales')} />
        <Stat label="Estimated profit" value={loading ? '—' : <MoneyText value={report?.estimatedProfit} amountStyle={{ color: '#188b67' }} />} accent="#188b67" onPress={() => onNavigate('Finance')} />
        <Stat label="Products" value={products.length ? String(products.length) : loading ? '—' : '0'} accent="#8067d7" onPress={() => onNavigate('Products')} />
        <Stat label="Low stock" value={loading ? '—' : String(lowStock.length)} accent="#d88b35" onPress={() => onNavigate('Stock')} />
      </View>
      <Card>
        <SectionTitle>Recent sales · {periodLabel}</SectionTitle>
        {reportSales.length ? reportSales.slice(0, 5).map((sale) => (
          <Row key={sale._id} title={saleSkuLabel(sale, products)} detail={`${shortDate(sale.saleDate)} · ${sale.paymentStatus}`} right={<MoneyText value={sale.total} />} />
        )) : <Empty>{loading ? 'Loading sales…' : 'No sales recorded for this period.'}</Empty>}
        <Button title="Open sales" secondary small onPress={() => onNavigate('Sales')} />
      </Card>
      <Card>
        <SectionTitle>Stock watch</SectionTitle>
        {lowStock.length ? lowStock.slice(0, 5).map((item) => (
          <Row key={`${item.productId}-${item.variantId}`} title={item.productName} detail={item.sku} right={`${item.quantity} ${item.unit ?? 'pcs'}`} />
        )) : <Empty>{loading ? 'Checking stock…' : 'All products are above their stock thresholds.'}</Empty>}
        <Button title="Review inventory" secondary small onPress={() => onNavigate('Inventory')} />
      </Card>
    </Page>
  );
}
