import type { Product, Sale } from './types';

export function moneyParts(value: number | undefined | null) {
  const currency = 'ETB';
  const parts = new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).formatToParts(value ?? 0);
  return {
    amount: parts
      .filter((part) => ['integer', 'group', 'decimal', 'fraction', 'minusSign'].includes(part.type))
      .map((part) => part.value)
      .join(''),
    currency,
  };
}

export function money(value: number | undefined | null) {
  const { amount, currency } = moneyParts(value);
  return `${amount} ${currency}`;
}

export function shortDate(value: string | Date | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
}

export function variantLabel(variant: {
  specification?: string;
  specifications?: Record<string, unknown>;
  sku: string;
}) {
  if (variant.specification?.trim()) return variant.specification;
  const values = Object.entries(variant.specifications ?? {}).map(([key, value]) => {
    const display = typeof value === 'object' && value !== null
      ? Object.values(value).join(' × ')
      : String(value);
    return `${key}: ${display}`;
  }).join(', ');
  return values || variant.sku;
}

export function saleSkuLabel(sale: Sale, products: Product[]) {
  return sale.items.map((item) => {
    let sku = item.sku;
    if (!sku) {
      const product = products.find((entry) => entry.name === item.productName);
      sku = product?.variants.find((variant) => variantLabel(variant) === item.variantName)?.sku;
    }
    return `${sku || 'SKU unavailable'} × ${item.quantity}`;
  }).join(', ');
}

export function dateInputToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
