import { useEffect, useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { apiRequest, jsonBody } from './api';
import { money, shortDate, variantLabel } from './format';
import type { Product, Sale, Variant } from './types';
import { Button, Card, Empty, Field, Notice, Page, Row, SectionTitle, SelectField, Stat, colors } from './ui';

type CartItem = { productId: string; variantId: string; productName: string; variantName: string; price: number; vatRate: number; available: number; quantity: string };

export function SalesScreen() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selection, setSelection] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const [saleList, productList] = await Promise.all([
        apiRequest<Sale[]>('/sales'),
        apiRequest<Product[]>('/products'),
      ]);
      setSales(saleList);
      setProducts(productList);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load sales.'); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    Promise.all([apiRequest<Sale[]>('/sales'), apiRequest<Product[]>('/products')])
      .then(([saleList, productList]) => { setSales(saleList); setProducts(productList); })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  const options = products.flatMap((product) => product.variants.filter((variant) => variant.quantity > 0).map((variant) => ({
    key: `${product._id}:${variant._id}`,
    product,
    variant,
  })));
  const subtotal = cart.reduce((total, item) => total + item.price * Number(item.quantity || 0), 0);
  const vat = cart.reduce((total, item) => total + item.price * Number(item.quantity || 0) * item.vatRate, 0);

  function addLine() {
    const option = options.find((item) => item.key === selection);
    if (!option) { setError('Select an in-stock product variant first.'); return; }
    setError('');
    setCart((current) => [
      ...current,
      {
        productId: option.product._id,
        variantId: option.variant._id,
        productName: option.product.name,
        variantName: variantLabel(option.variant),
        price: option.variant.sellingPrice,
        vatRate: option.variant.vatRate ?? 0.15,
        available: option.variant.quantity,
        quantity: '1',
      },
    ]);
  }

  async function submitSale() {
    if (!cart.length || cart.some((item) => !Number(item.quantity) || Number(item.quantity) < 1 || Number(item.quantity) > item.available)) {
      setError('Add items and enter quantities within the available stock.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await apiRequest('/sales', {
        method: 'POST',
        body: jsonBody({
          items: cart.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: Number(item.quantity) })),
          paymentMethod,
          paymentStatus,
        }),
      });
      setCart([]);
      setEditor(false);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not record the sale.'); }
    finally { setBusy(false); }
  }

  return (
    <Page title="Sales" subtitle="Create sales and review recent transactions."
      action={<Button title="+ New sale" onPress={() => { setEditor(true); setError(''); }} small />}>
      {error ? <Notice>{error}</Notice> : null}
      <View style={{ flexDirection: 'row', gap: 9 }}>
        <Stat label="Transactions" value={loading ? '—' : String(sales.length)} />
        <Stat label="Sales total" value={loading ? '—' : money(sales.reduce((sum, sale) => sum + sale.total, 0))} accent="#188b67" />
        <Stat label="Pending" value={loading ? '—' : money(sales.filter((sale) => sale.paymentStatus === 'pending').reduce((sum, sale) => sum + sale.total, 0))} accent="#d88b35" />
      </View>
      <Card>
        <SectionTitle>Transaction history</SectionTitle>
        {loading ? <Empty>Loading sales…</Empty> : sales.length ? sales.map((sale) => (
          <Row key={sale._id} title={sale.saleReference} detail={`${shortDate(sale.saleDate)} · ${sale.items.length} line(s) · ${sale.paymentMethod} · ${sale.paymentStatus}`} right={money(sale.total)} />
        )) : <Empty>No sales have been recorded yet.</Empty>}
      </Card>
      <Modal visible={editor} animationType="slide" onRequestClose={() => setEditor(false)}>
        <Page title="New sale" subtitle="Prices and VAT are calculated from product settings.">
          {error ? <Notice>{error}</Notice> : null}
          <SelectField label="Add product variant" value={selection} options={options.map(({ key, product, variant }) => ({
            value: key,
            label: `${product.name} · ${variantLabel(variant)} · ${variant.quantity} in stock`,
          }))} onChange={setSelection} />
          <Button title="Add to sale" secondary onPress={addLine} />
          <Card>
            <SectionTitle>Sale items ({cart.length})</SectionTitle>
            {cart.length ? cart.map((item, index) => (
              <View key={`${item.variantId}-${index}`} style={{ gap: 7, borderBottomWidth: 1, borderBottomColor: '#eef1f5', paddingBottom: 10 }}>
                <Row title={item.productName} detail={`${item.variantName} · ${money(item.price)} each · ${item.available} available`} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ flex: 1 }}><Field label="Quantity" value={item.quantity} onChangeText={(quantity) => setCart((current) => current.map((entry, at) => at === index ? { ...entry, quantity } : entry))} keyboardType="numeric" /></View>
                  <Button title="Remove" danger small onPress={() => setCart((current) => current.filter((_, at) => at !== index))} />
                </View>
              </View>
            )) : <Empty>Add one or more products to the sale.</Empty>}
          </Card>
          <SelectField label="Payment method" value={paymentMethod} options={[
            { label: 'Cash', value: 'cash' }, { label: 'Card', value: 'card' },
            { label: 'Bank transfer', value: 'bank-transfer' }, { label: 'Other', value: 'other' },
          ]} onChange={setPaymentMethod} />
          <SelectField label="Payment status" value={paymentStatus} options={[
            { label: 'Paid', value: 'paid' }, { label: 'Pending', value: 'pending' },
          ]} onChange={setPaymentStatus} />
          <Card>
            <Row title="Subtotal" right={money(subtotal)} />
            <Row title="Estimated VAT" right={money(vat)} />
            <Row title="Total" right={money(subtotal + vat)} />
          </Card>
          <Button title={busy ? 'Recording…' : 'Complete sale'} onPress={() => void submitSale()} disabled={busy || cart.length === 0} />
          <Button title="Cancel" secondary onPress={() => setEditor(false)} />
        </Page>
      </Modal>
    </Page>
  );
}
