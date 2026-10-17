export function money(value: number | undefined | null) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: process.env.EXPO_PUBLIC_CURRENCY_CODE ?? 'USD',
    maximumFractionDigits: 2,
  }).format(value ?? 0);
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

export function dateInputToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
