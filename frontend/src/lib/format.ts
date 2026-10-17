import type { CategorySpecificationField } from '@/lib/types';

export function money(value: number | undefined | null) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: process.env.NEXT_PUBLIC_CURRENCY_CODE ?? 'USD',
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export function shortDate(value: string | Date | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
}

export function variantLabel(variant: {
  specification?: string;
  specifications?: Record<string, unknown>;
  sku: string;
}, specificationFields: CategorySpecificationField[] = []) {
  if (variant.specification?.trim()) return variant.specification;
  const specs = Object.entries(variant.specifications ?? {})
    .map(([key, value]) => {
      const text =
        typeof value === 'object' && value !== null
          ? Object.values(value).join(' × ')
          : String(value);
      const label = specificationFields.find((field) => field.key === key)?.label ?? key;
      return `${label}: ${text}`;
    })
    .join(', ');
  return specs || variant.sku;
}
