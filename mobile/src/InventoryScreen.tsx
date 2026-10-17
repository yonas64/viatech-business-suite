import { useEffect, useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { apiRequest, jsonBody } from './api';
import { shortDate, variantLabel } from './format';
import type { Movement, Product, StockItem } from './types';
import { Button, Card, Empty, Field, Notice, Page, Row, SectionTitle, SelectField, Stat, colors } from './ui';

export function InventoryScreen({ isAdmin }: { isAdmin: boolean }) {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(false);
  const [selected, setSelected] = useState('');
  const [kind, setKind] = useState<'add' | 'remove' | 'adjust'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const [stockItems, productList, movementPage] = await Promise.all([
        apiRequest<StockItem[]>('/inventory/stock'),
        apiRequest<Product[]>('/products'),
        apiRequest<{ items: Movement[] }>('/inventory/movements?limit=20'),
      ]);
      setStock(stockItems);
      setProducts(productList);
      setMovements(movementPage.items);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load inventory.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    Promise.all([
      apiRequest<StockItem[]>('/inventory/stock'),
      apiRequest<Product[]>('/products'),
      apiRequest<{ items: Movement[] }>('/inventory/movements?limit=20'),
    ]).then(([stockItems, productList, movementPage]) => {
      setStock(stockItems);
      setProducts(productList);
      setMovements(movementPage.items);
    }).catch((cause: Error) => setError(cause.message)).finally(() => setLoading(false));
  }, []);

  const variants = products.flatMap((product) => product.variants.map((variant) => ({
    product,
    variant,
    key: `${product._id}:${variant._id}`,
  })));

  async function submit() {
    const [productId, variantId] = selected.split(':');
    if (!productId || !variantId || !quantity || !reason.trim()) {
      setError('Select a product, quantity, and reason.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const endpoint = kind === 'add' ? 'add' : kind === 'remove' ? 'remove' : 'adjust';
      await apiRequest(`/inventory/stock/${endpoint}`, {
        method: 'POST',
        body: jsonBody({ productId, variantId, quantity: Number(quantity), reason }),
      });
      setEditor(false);
      setQuantity('');
      setReason('');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update stock.');
    } finally {
      setBusy(false);
    }
  }

  const unitCount = stock.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <Page title="Inventory" subtitle="Current stock levels and movement history."
      action={isAdmin ? <Button title="Update stock" onPress={() => { setEditor(true); setError(''); }} small /> : undefined}>
      {error ? <Notice>{error}</Notice> : null}
      <View style={{ flexDirection: 'row', gap: 9, flexWrap: 'wrap' }}>
        <Stat label="Units on hand" value={loading ? '—' : String(unitCount)} />
        <Stat label="Tracked variants" value={loading ? '—' : String(stock.length)} accent="#8067d7" />
        <Stat label="Low stock" value={loading ? '—' : String(stock.filter((item) => item.isLowStock).length)} accent="#d88b35" />
      </View>
      <Card>
        <SectionTitle>Current stock</SectionTitle>
        {loading ? <Empty>Loading stock…</Empty> : stock.length ? stock.map((item) => (
          <Row key={`${item.productId}-${item.variantId}`}
            title={item.productName}
            detail={`${item.specification || item.sku} · SKU ${item.sku} · threshold ${item.lowStockThreshold}`}
            right={`${item.quantity} ${item.unit ?? 'pcs'}${item.isLowStock ? ' · LOW' : ''}`}
          />
        )) : <Empty>No stock to display. Create a product first.</Empty>}
      </Card>
      <Card>
        <SectionTitle>Recent movements</SectionTitle>
        {movements.length ? movements.map((movement) => (
          <Row key={movement._id}
            title={`${movement.movementType.toUpperCase()} · ${typeof movement.product === 'object' ? movement.product.name : 'Product'}`}
            detail={`${shortDate(movement.createdAt)} · ${movement.reason} · ${movement.createdBy?.name ?? ''}`}
            right={`${movement.beforeQuantity} → ${movement.afterQuantity}`}
          />
        )) : <Empty>{loading ? 'Loading movements…' : 'No inventory movements recorded yet.'}</Empty>}
      </Card>
      <Modal visible={editor} animationType="slide" onRequestClose={() => setEditor(false)}>
        <Page title="Update stock" subtitle="Every update is recorded in inventory history.">
          {error ? <Notice>{error}</Notice> : null}
          <SelectField label="Product variant" value={selected} options={variants.map(({ product, variant, key }) => ({
            value: key,
            label: `${product.name} · ${variantLabel(variant)}`,
          }))} onChange={setSelected} />
          <SelectField label="Movement" value={kind} options={[
            { label: 'Add stock', value: 'add' },
            { label: 'Remove stock', value: 'remove' },
            { label: 'Set count', value: 'adjust' },
          ]} onChange={(value) => setKind(value as typeof kind)} />
          <Field label={kind === 'adjust' ? 'Counted quantity' : 'Quantity'} value={quantity} onChangeText={setQuantity} keyboardType="numeric" required />
          <Field label="Reason" value={reason} onChangeText={setReason} placeholder="Supplier delivery, damage, stock count…" required />
          <Button title={busy ? 'Saving…' : 'Save movement'} onPress={() => void submit()} disabled={busy} />
          <Button title="Cancel" secondary onPress={() => setEditor(false)} />
        </Page>
      </Modal>
    </Page>
  );
}
