"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { apiRequest, jsonBody } from '@/lib/api/config';
import { money, variantLabel } from '@/lib/format';
import type { Category, Product } from '@/lib/types';
import { useCurrentUser } from '@/components/auth-context';
import { EmptyState, Notice, PageHeading, SectionTitle } from '@/components/ui';

type VariantDraft = {
  id?: string;
  sku: string;
  costPrice: string;
  sellingPrice: string;
  quantity: string;
  unit: string;
  lowStockThreshold: string;
  vatRate: string;
  specifications: Record<string, string>;
};

function newVariant(): VariantDraft {
  return {
    sku: '',
    costPrice: '',
    sellingPrice: '',
    quantity: '',
    unit: 'pcs',
    lowStockThreshold: '5',
    vatRate: '0.15',
    specifications: {},
  };
}

function variantDraftFromProduct(product: Product): VariantDraft[] {
  return product.variants.map((variant) => {
    const specifications: Record<string, string> = {};
    for (const [key, value] of Object.entries(variant.specifications ?? {})) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        for (const [axis, dimension] of Object.entries(value)) {
          specifications[`${key}.${axis}`] = String(dimension);
        }
      } else {
        specifications[key] = String(value);
      }
    }
    return {
      id: variant._id,
      sku: variant.sku,
      costPrice: String(variant.costPrice),
      sellingPrice: String(variant.sellingPrice),
      quantity: String(variant.quantity),
      unit: variant.unit ?? 'pcs',
      lowStockThreshold: String(variant.lowStockThreshold ?? 5),
      vatRate: String(variant.vatRate ?? 0.15),
      specifications,
    };
  });
}

export default function ProductsPage() {
  const user = useCurrentUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', categoryId: '' });
  const [variants, setVariants] = useState<VariantDraft[]>([newVariant()]);
  const selectedCategory = categories.find((category) => category._id === form.categoryId);

  async function load() {
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        apiRequest<Product[]>('/products'),
        apiRequest<Category[]>('/categories'),
      ]);
      setProducts(productsResult);
      setCategories(categoriesResult);
      if (!form.categoryId && categoriesResult[0]) setForm((current) => ({ ...current, categoryId: categoriesResult[0]._id }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load products.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([
      apiRequest<Product[]>('/products'),
      apiRequest<Category[]>('/categories'),
    ])
      .then(([productsResult, categoriesResult]) => {
        setProducts(productsResult);
        setCategories(categoriesResult);
        if (categoriesResult[0]) setForm((current) => ({ ...current, categoryId: categoriesResult[0]._id }));
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleProducts = useMemo(() => products.filter((product) => {
    const query = search.trim().toLowerCase();
    return !query || product.name.toLowerCase().includes(query) ||
      product.variants.some((variant) => variant.sku.toLowerCase().includes(query));
  }), [products, search]);

  function updateVariant(index: number, update: Partial<VariantDraft>) {
    setVariants((current) => current.map((variant, variantIndex) =>
      variantIndex === index ? { ...variant, ...update } : variant,
    ));
  }

  function specificationInput(
    field: NonNullable<Category['specificationFields']>[number],
    variantIndex: number,
  ) {
    const specifications = variants[variantIndex].specifications;
    if (field.type === 'dimensions') {
      const hasDimensions = ['width', 'height', 'depth'].some(
        (axis) => Boolean(specifications[`${field.key}.${axis}`]),
      );
      return <div className="dimension-inputs" key={field.key}>
        {(['width', 'height', 'depth'] as const).map((axis) => (
          <input key={axis} type="number" min="0" step="any" placeholder={axis} aria-label={`${field.label} ${axis}`}
            required={(field.required !== false || hasDimensions) && axis !== 'depth'}
            value={specifications[`${field.key}.${axis}`] ?? ''}
            onChange={(event) => updateVariant(variantIndex, {
              specifications: { ...specifications, [`${field.key}.${axis}`]: event.target.value },
            })} />
        ))}
      </div>;
    }
    return <input key={field.key} type={field.type === 'number' ? 'number' : 'text'} min="0" step={field.type === 'number' ? 'any' : undefined}
      required={field.required !== false} placeholder={field.unit ? `Value (${field.unit})` : field.label}
      value={specifications[field.key] ?? ''}
      onChange={(event) => updateVariant(variantIndex, {
        specifications: { ...specifications, [field.key]: event.target.value },
      })} />;
  }

  function buildSpecifications(variant: VariantDraft) {
    const result: Record<string, unknown> = {};
    for (const field of selectedCategory?.specificationFields ?? []) {
      if (field.type === 'dimensions') {
        const dimensions: Record<string, number> = {};
        for (const axis of ['width', 'height', 'depth']) {
          const value = variant.specifications[`${field.key}.${axis}`];
          if (value !== undefined && value !== '') dimensions[axis] = Number(value);
        }
        if (Object.keys(dimensions).length) result[field.key] = dimensions;
      } else if (variant.specifications[field.key] !== undefined && variant.specifications[field.key] !== '') {
        result[field.key] = field.type === 'number'
          ? Number(variant.specifications[field.key])
          : variant.specifications[field.key];
      }
    }
    return result;
  }

  function openCreateForm() {
    setEditingProduct(null);
    setForm({
      name: '',
      description: '',
      categoryId: categories[0]?._id ?? '',
    });
    setVariants([newVariant()]);
    setError('');
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description ?? '',
      categoryId: typeof product.category === 'string' ? product.category : product.category._id,
    });
    setVariants(variantDraftFromProduct(product));
    setError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingProduct(null);
  }

  async function archiveProduct(product: Product) {
    if (!window.confirm(`Archive "${product.name}"? It will no longer appear in active products or be available for new sales.`)) return;
    setError('');
    try {
      await apiRequest(`/products/${product._id}`, { method: 'DELETE' });
      setProducts((current) => current.filter((item) => item._id !== product._id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not archive product.');
    }
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const duplicateSku = variants.find((variant, index) =>
      variants.some((other, otherIndex) =>
        otherIndex !== index && other.sku.trim().toLowerCase() === variant.sku.trim().toLowerCase(),
      ),
    );
    if (duplicateSku) {
      setError(`Each variant needs a unique SKU. "${duplicateSku.sku}" is used more than once.`);
      return;
    }
    if (variants.length === 0) {
      setError('A product must have at least one variant.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (editingProduct) {
        for (const variant of variants) {
          const variantPayload = {
            sku: variant.sku,
            costPrice: Number(variant.costPrice),
            sellingPrice: Number(variant.sellingPrice),
            quantity: Number(variant.quantity),
            unit: variant.unit,
            lowStockThreshold: Number(variant.lowStockThreshold),
            vatRate: Number(variant.vatRate),
            specifications: buildSpecifications(variant),
          };
          if (variant.id) {
            await apiRequest(`/products/${editingProduct._id}/variants/${variant.id}`, {
              method: 'PATCH',
              body: jsonBody(variantPayload),
            });
          } else {
            await apiRequest(`/products/${editingProduct._id}/variants`, {
              method: 'POST',
              body: jsonBody(variantPayload),
            });
          }
        }
        const retainedIds = new Set(variants.flatMap((variant) => variant.id ? [variant.id] : []));
        for (const originalVariant of editingProduct.variants) {
          if (!retainedIds.has(originalVariant._id)) {
            await apiRequest(`/products/${editingProduct._id}/variants/${originalVariant._id}`, {
              method: 'DELETE',
            });
          }
        }
        await apiRequest(`/products/${editingProduct._id}`, {
          method: 'PATCH',
          body: jsonBody({
            name: form.name,
            description: form.description,
            categoryId: form.categoryId,
          }),
        });
      } else {
        await apiRequest('/products', {
          method: 'POST',
          body: jsonBody({
          name: form.name,
          description: form.description,
          categoryId: form.categoryId,
          variants: variants.map((variant) => ({
            sku: variant.sku,
            costPrice: Number(variant.costPrice),
            sellingPrice: Number(variant.sellingPrice),
            quantity: Number(variant.quantity),
            unit: variant.unit,
            lowStockThreshold: Number(variant.lowStockThreshold),
            vatRate: Number(variant.vatRate),
            specifications: buildSpecifications(variant),
          })),
          }),
        });
      }
      closeForm();
      await load();
    } catch (reason) {
      setError(`${reason instanceof Error ? reason.message : 'Could not save product.'}${editingProduct ? ' Some changes may already have been saved; review the product and try again.' : ''}`);
    } finally {
      setBusy(false);
    }
  }

  return <>
    <PageHeading eyebrow="CATALOG" title="Products" description="Manage the items and variants your business sells."
      action={user?.role === 'admin' && <button className="button button-primary" onClick={openCreateForm}><span>＋</span> Add product</button>} />
    {error && <Notice>{error}</Notice>}
    {showForm && user?.role === 'admin' && <section className="panel form-panel">
      <SectionTitle
        title={editingProduct ? `Edit ${editingProduct.name}` : 'Add a product'}
        description={editingProduct ? 'Update product details and manage its variants.' : 'Create a product with one or more stock-keeping variants.'}
      />
      {!categories.length ? <Notice kind="info">Create a category before adding products.</Notice> :
        <form onSubmit={createProduct} className="form-grid">
          <label>Product name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Desk lamp" /></label>
          <label>Category<select required value={form.categoryId} onChange={(event) => {
            setForm({ ...form, categoryId: event.target.value });
            setVariants((current) => current.map((variant) => ({ ...variant, specifications: {} })));
          }}>
            {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
          </select></label>
          {editingProduct && <div className="category-edit-note span-two">Changing category is allowed when every remaining variant’s specifications satisfy the new category. The backend checks this before saving.</div>}
          <label className="span-two">Description<input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Optional product details" /></label>
          <div className="variant-list span-two">
            {variants.map((variant, index) => (
              <fieldset className="variant-card" key={index}>
                <legend>Variant {index + 1}</legend>
                {variants.length > 1 && <button
                  type="button"
                  className="icon-button danger-button variant-remove"
                  aria-label={`Remove variant ${index + 1}`}
                  onClick={() => setVariants((current) => current.filter((_, variantIndex) => variantIndex !== index))}
                >×</button>}
                {selectedCategory?.specificationFields?.length ? (
                  <div className="variant-specification-section">
                    <div className="variant-section-heading">
                      <strong>Variant specifications</strong>
                      <span>Values are defined by the selected category.</span>
                    </div>
                    <div className="variant-fields">
                      {selectedCategory.specificationFields.map((field) => (
                        <label key={field.key}>
                          {field.label}{field.unit ? ` (${field.unit})` : ''}
                          {field.required === false && <span className="optional">Optional</span>}
                          {specificationInput(field, index)}
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="variant-specification-empty">
                    This category has no specification fields yet. Add them to the category first so each variant can capture its details.
                    <Link href="/categories">Manage category specifications →</Link>
                  </div>
                )}
                <div className="variant-section-heading variant-details-heading">
                  <strong>Variant stock and pricing</strong>
                  <span>Each specification combination needs its own SKU and stock details.</span>
                </div>
                <div className="variant-fields">
                  <label>SKU<input required value={variant.sku} onChange={(event) => updateVariant(index, { sku: event.target.value })} placeholder={`SKU-00${index + 1}`} /></label>
                  <label>Initial quantity<input required type="number" min="0" step="1" value={variant.quantity} onChange={(event) => updateVariant(index, { quantity: event.target.value })} /></label>
                  <label>Cost price<input required type="number" min="0" step="0.01" value={variant.costPrice} onChange={(event) => updateVariant(index, { costPrice: event.target.value })} /></label>
                  <label>Selling price<input required type="number" min="0" step="0.01" value={variant.sellingPrice} onChange={(event) => updateVariant(index, { sellingPrice: event.target.value })} /></label>
                  <label>Unit<input required value={variant.unit} onChange={(event) => updateVariant(index, { unit: event.target.value })} placeholder="pcs" /></label>
                  <label>Low stock threshold<input type="number" min="0" step="1" value={variant.lowStockThreshold} onChange={(event) => updateVariant(index, { lowStockThreshold: event.target.value })} /></label>
                  <label>VAT rate<input type="number" min="0" max="1" step="0.01" value={variant.vatRate} onChange={(event) => updateVariant(index, { vatRate: event.target.value })} /><small>Decimal, e.g. 0.15 for 15%.</small></label>
                </div>
              </fieldset>
            ))}
          </div>
          <div className="variant-actions span-two">
            <button type="button" className="button button-secondary" onClick={() => setVariants((current) => [...current, newVariant()])}>＋ Add another variant</button>
            <span>{variants.length} {variants.length === 1 ? 'variant' : 'variants'}</span>
          </div>
          <div className="form-actions span-two"><button type="button" className="button button-secondary" onClick={closeForm}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : editingProduct ? 'Save product changes' : `Save product with ${variants.length} ${variants.length === 1 ? 'variant' : 'variants'}`}</button></div>
        </form>}
    </section>}
    <section className="panel">
      <div className="section-title section-title-spaced">
        <div><h2>Product catalog</h2><p>{products.length} active products in your catalog</p></div>
        <input className="search-input" aria-label="Search products" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or SKU…" />
      </div>
      {loading ? <div className="loading-state">Loading products…</div> : visibleProducts.length ? <div className="table-wrap">
        <table><thead><tr><th>Product</th><th>Category</th><th>Variants / SKU</th><th>In stock</th><th>Price</th><th>Status</th>{user?.role === 'admin' && <th>Actions</th>}</tr></thead>
          <tbody>{visibleProducts.map((product) => product.variants.map((variant, index) => <tr key={variant._id}>
            {index === 0 && <td rowSpan={product.variants.length}><strong>{product.name}</strong>{product.description && <small className="table-subtitle">{product.description}</small>}</td>}
            {index === 0 && <td rowSpan={product.variants.length}>{typeof product.category === 'string' ? '—' : product.category?.name}</td>}
            <td>{variantLabel(variant, typeof product.category === 'string' ? [] : product.category.specificationFields)}<small className="table-subtitle">{variant.sku}</small></td>
            <td><span className={`quantity ${variant.quantity <= (variant.lowStockThreshold ?? 0) ? 'quantity-low' : ''}`}>{variant.quantity}</span> <small>{variant.unit ?? 'pcs'}</small></td>
            <td><strong>{money(variant.sellingPrice)}</strong></td>
            {index === 0 && <td rowSpan={product.variants.length}><span className="status status-paid">Active</span></td>}
            {index === 0 && user?.role === 'admin' && <td rowSpan={product.variants.length}><div className="expense-actions">
              <button className="button button-secondary" onClick={() => openEditForm(product)}>Edit</button>
              <button className="button expense-delete" onClick={() => void archiveProduct(product)}>Archive</button>
            </div></td>}
          </tr>))}</tbody>
        </table>
      </div> : <EmptyState>{search ? 'No products match your search.' : 'No products yet. Add your first product to get started.'}</EmptyState>}
    </section>
  </>;
}
