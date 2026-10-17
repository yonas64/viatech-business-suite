import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, Text, View } from 'react-native';
import { apiRequest, jsonBody } from './api';
import { money, variantLabel } from './format';
import type { Category, Product, SpecificationField, Variant } from './types';
import { Button, Card, Empty, Field, Notice, Page, Row, SectionTitle, SelectField, colors, uiStyles } from './ui';

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

function emptyVariant(): VariantDraft {
  return { sku: '', costPrice: '', sellingPrice: '', quantity: '', unit: 'pcs', lowStockThreshold: '5', vatRate: '0.15', specifications: {} };
}

function variantToDraft(variant: Variant): VariantDraft {
  const specifications: Record<string, string> = {};
  Object.entries(variant.specifications ?? {}).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(([axis, dimension]) => { specifications[`${key}.${axis}`] = String(dimension); });
    } else specifications[key] = String(value);
  });
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
}

export function ProductsScreen({ isAdmin }: { isAdmin: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [editor, setEditor] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant()]);

  async function load() {
    try {
      const [productList, categoryList] = await Promise.all([
        apiRequest<Product[]>('/products'),
        apiRequest<Category[]>('/categories'),
      ]);
      setProducts(productList);
      setCategories(categoryList);
      if (!categoryId && categoryList[0]) setCategoryId(categoryList[0]._id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the product catalog.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([apiRequest<Product[]>('/products'), apiRequest<Category[]>('/categories')])
      .then(([productList, categoryList]) => {
        setProducts(productList);
        setCategories(categoryList);
        if (categoryList[0]) setCategoryId(categoryList[0]._id);
      })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => products.filter((product) => {
    const value = search.trim().toLowerCase();
    return !value || product.name.toLowerCase().includes(value) ||
      product.variants.some((variant) => variant.sku.toLowerCase().includes(value));
  }), [products, search]);
  const category = categories.find((item) => item._id === categoryId);

  function openCreate() {
    setEditing(null);
    setName('');
    setDescription('');
    setCategoryId(categories[0]?._id ?? '');
    setVariants([emptyVariant()]);
    setError('');
    setEditor(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setName(product.name);
    setDescription(product.description ?? '');
    setCategoryId(typeof product.category === 'string' ? product.category : product.category._id);
    setVariants(product.variants.map(variantToDraft));
    setError('');
    setEditor(true);
  }

  function updateVariant(index: number, update: Partial<VariantDraft>) {
    setVariants((current) => current.map((variant, at) => at === index ? { ...variant, ...update } : variant));
  }

  function buildSpecifications(variant: VariantDraft) {
    const result: Record<string, unknown> = {};
    (category?.specificationFields ?? []).forEach((field) => {
      if (field.type === 'dimensions') {
        const dimensions: Record<string, number> = {};
        ['width', 'height', 'depth'].forEach((axis) => {
          const value = variant.specifications[`${field.key}.${axis}`];
          if (value !== undefined && value !== '') dimensions[axis] = Number(value);
        });
        if (Object.keys(dimensions).length) result[field.key] = dimensions;
      } else {
        const value = variant.specifications[field.key];
        if (value !== undefined && value !== '') result[field.key] = field.type === 'number' ? Number(value) : value;
      }
    });
    return result;
  }

  function toVariantPayload(variant: VariantDraft) {
    return {
      sku: variant.sku.trim(),
      costPrice: Number(variant.costPrice),
      sellingPrice: Number(variant.sellingPrice),
      quantity: Number(variant.quantity),
      unit: variant.unit.trim(),
      lowStockThreshold: Number(variant.lowStockThreshold || 0),
      vatRate: Number(variant.vatRate || 0),
      specifications: buildSpecifications(variant),
    };
  }

  async function save() {
    setError('');
    if (!name.trim() || !categoryId || variants.length === 0) {
      setError('Add a product name, category, and at least one variant.');
      return;
    }
    const skuSet = variants.map((variant) => variant.sku.trim().toLowerCase());
    if (skuSet.some((sku, index) => !sku || skuSet.indexOf(sku) !== index)) {
      setError('Every variant needs a unique SKU.');
      return;
    }
    setBusy(true);
    try {
      if (!editing) {
        await apiRequest('/products', {
          method: 'POST',
          body: jsonBody({
            name: name.trim(),
            description,
            categoryId,
            variants: variants.map(toVariantPayload),
          }),
        });
      } else {
        await apiRequest(`/products/${editing._id}`, {
          method: 'PATCH',
          body: jsonBody({ name: name.trim(), description, categoryId }),
        });
        for (const variant of variants) {
          if (variant.id) {
            await apiRequest(`/products/${editing._id}/variants/${variant.id}`, {
              method: 'PATCH',
              body: jsonBody(toVariantPayload(variant)),
            });
          } else {
            await apiRequest(`/products/${editing._id}/variants`, {
              method: 'POST',
              body: jsonBody(toVariantPayload(variant)),
            });
          }
        }
        const kept = new Set(variants.flatMap((variant) => variant.id ? [variant.id] : []));
        for (const oldVariant of editing.variants) {
          if (!kept.has(oldVariant._id)) {
            await apiRequest(`/products/${editing._id}/variants/${oldVariant._id}`, { method: 'DELETE' });
          }
        }
      }
      setEditor(false);
      setEditing(null);
      await load();
    } catch (cause) {
      setError(`${cause instanceof Error ? cause.message : 'Could not save product.'}${editing ? ' Changes are sent individually; review the product before retrying.' : ''}`);
    } finally {
      setBusy(false);
    }
  }

  function archive(product: Product) {
    Alert.alert('Archive product?', `"${product.name}" will no longer be available for new sales.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Archive', style: 'destructive', onPress: () => {
        void apiRequest(`/products/${product._id}`, { method: 'DELETE' })
          .then(() => setProducts((current) => current.filter((item) => item._id !== product._id)))
          .catch((cause: Error) => setError(cause.message));
      } },
    ]);
  }

  return (
    <Page title="Products" subtitle="Catalog, stock keeping units, and variants."
      action={isAdmin ? <Button title="+ Add" onPress={openCreate} small /> : undefined}>
      {error ? <Notice>{error}</Notice> : null}
      {isAdmin ? <Field label="Search products" value={search} onChangeText={setSearch} placeholder="Name or SKU" /> : null}
      {loading ? <Card><Empty>Loading catalog…</Empty></Card> : filtered.length ? filtered.map((product) => (
        <Card key={product._id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.ink, fontSize: 15, fontWeight: '800' }}>{product.name}</Text>
              <Text style={{ color: colors.muted, fontSize: 10, marginTop: 4 }}>
                {typeof product.category === 'string' ? 'Category' : product.category.name}
                {product.description ? ` · ${product.description}` : ''}
              </Text>
            </View>
          </View>
          <SectionTitle>Variants ({product.variants.length})</SectionTitle>
          {product.variants.map((variant) => (
            <Row key={variant._id} title={variantLabel(variant)} detail={`${variant.sku} · ${variant.quantity} ${variant.unit ?? 'pcs'} · Cost ${money(variant.costPrice)}`} right={money(variant.sellingPrice)} />
          ))}
          {isAdmin ? <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="Edit" secondary small onPress={() => openEdit(product)} />
            <Button title="Archive" danger small onPress={() => archive(product)} />
          </View> : null}
        </Card>
      )) : <Card><Empty>{search ? 'No products match your search.' : 'No products in the catalog yet.'}</Empty></Card>}

      <Modal visible={editor} animationType="slide" onRequestClose={() => setEditor(false)}>
        <Page title={editing ? 'Edit product' : 'New product'} subtitle="Specify variants using the selected category.">
          {error ? <Notice>{error}</Notice> : null}
          <Field label="Product name" value={name} onChangeText={setName} required />
          <Field label="Description" value={description} onChangeText={setDescription} />
          <SelectField
            label="Category"
            value={categoryId}
            options={categories.map((item) => ({ label: item.name, value: item._id }))}
            onChange={(id) => {
              setCategoryId(id);
              setVariants((current) => current.map((variant) => ({ ...variant, specifications: {} })));
            }}
          />
          {editing ? <Notice>Changing category requires all variant specifications to satisfy the new category. The backend validates the change.</Notice> : null}
          {variants.map((variant, index) => (
            <Card key={index}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <SectionTitle>Variant {index + 1}</SectionTitle>
                {variants.length > 1 ? <Button title="Remove" danger small onPress={() => setVariants((current) => current.filter((_, at) => at !== index))} /> : null}
              </View>
              {(category?.specificationFields ?? []).map((field) => (
                <SpecificationInput key={field.key} field={field} variant={variant} onChange={(specifications) => updateVariant(index, { specifications })} />
              ))}
              <SectionTitle>Stock and pricing</SectionTitle>
              <Field label="SKU" value={variant.sku} onChangeText={(sku) => updateVariant(index, { sku })} required autoCapitalize="characters" />
              <View style={{ flexDirection: 'row', gap: 9 }}>
                <Field label="Cost price" value={variant.costPrice} onChangeText={(costPrice) => updateVariant(index, { costPrice })} keyboardType="decimal-pad" required />
                <Field label="Selling price" value={variant.sellingPrice} onChangeText={(sellingPrice) => updateVariant(index, { sellingPrice })} keyboardType="decimal-pad" required />
              </View>
              <View style={{ flexDirection: 'row', gap: 9 }}>
                <Field label="Quantity" value={variant.quantity} onChangeText={(quantity) => updateVariant(index, { quantity })} keyboardType="numeric" required />
                <Field label="Unit" value={variant.unit} onChangeText={(unit) => updateVariant(index, { unit })} />
              </View>
              <View style={{ flexDirection: 'row', gap: 9 }}>
                <Field label="Low stock threshold" value={variant.lowStockThreshold} onChangeText={(lowStockThreshold) => updateVariant(index, { lowStockThreshold })} keyboardType="numeric" />
                <Field label="VAT rate (e.g. 0.15)" value={variant.vatRate} onChangeText={(vatRate) => updateVariant(index, { vatRate })} keyboardType="decimal-pad" />
              </View>
            </Card>
          ))}
          {category?.specificationFields?.length ? null : <Notice>Define specification fields in Categories first; otherwise variants can only be distinguished by SKU.</Notice>}
          <Button title="+ Add variant" secondary onPress={() => setVariants((current) => [...current, emptyVariant()])} />
          <Button title={busy ? 'Saving…' : editing ? 'Save changes' : 'Create product'} onPress={() => void save()} disabled={busy} />
          <Button title="Cancel" secondary onPress={() => setEditor(false)} />
        </Page>
      </Modal>
    </Page>
  );
}

function SpecificationInput({
  field,
  variant,
  onChange,
}: {
  field: SpecificationField;
  variant: VariantDraft;
  onChange: (value: Record<string, string>) => void;
}) {
  const update = (key: string, value: string) => onChange({ ...variant.specifications, [key]: value });
  if (field.type === 'dimensions') {
    return (
      <View style={{ gap: 7 }}>
        <Text style={uiStyles.fieldLabel}>{field.label}{field.unit ? ` (${field.unit})` : ''}{field.required === false ? ' · optional' : ' *'}</Text>
        <View style={{ flexDirection: 'row', gap: 7 }}>
          {(['width', 'height', 'depth'] as const).map((axis) => (
            <View key={axis} style={{ flex: 1 }}>
              <Field label={axis} value={variant.specifications[`${field.key}.${axis}`] ?? ''} onChangeText={(value) => update(`${field.key}.${axis}`, value)} keyboardType="decimal-pad" />
            </View>
          ))}
        </View>
      </View>
    );
  }
  return (
    <Field label={`${field.label}${field.unit ? ` (${field.unit})` : ''}${field.required === false ? ' · optional' : ' *'}`}
      value={variant.specifications[field.key] ?? ''}
      onChangeText={(value) => update(field.key, value)}
      keyboardType={field.type === 'number' ? 'decimal-pad' : 'default'}
      required={field.required !== false}
    />
  );
}
