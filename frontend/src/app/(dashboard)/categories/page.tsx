"use client";

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { apiRequest, jsonBody } from '@/lib/api/config';
import type { Category, CategorySpecificationField } from '@/lib/types';
import { useCurrentUser } from '@/components/auth-context';
import { EmptyState, Notice, PageHeading, SectionTitle } from '@/components/ui';

type SpecificationFieldDraft = CategorySpecificationField;

export default function CategoriesPage() {
  const user = useCurrentUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [specificationFields, setSpecificationFields] = useState<SpecificationFieldDraft[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    try { setCategories(await apiRequest<Category[]>('/categories')); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not load categories.'); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    apiRequest<Category[]>('/categories')
      .then(setCategories)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => categories.filter((category) =>
    category.name.toLowerCase().includes(search.trim().toLowerCase())), [categories, search]);

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const keys = specificationFields.map((field) => field.key.trim().toLowerCase());
    if (new Set(keys).size !== keys.length) {
      setError('Each specification must have a unique field key.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const payload = {
        name,
        description,
        specificationFields: specificationFields.map((field) => ({
          ...field,
          unit: field.unit?.trim() ?? '',
        })),
      };
      await apiRequest(editingCategory ? `/categories/${editingCategory._id}` : '/categories', {
        method: editingCategory ? 'PATCH' : 'POST',
        body: jsonBody(payload),
      });
      setName('');
      setDescription('');
      setSpecificationFields([]);
      setEditingCategory(null);
      setShowForm(false);
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save category.'); }
    finally { setBusy(false); }
  }

  function openCreateForm() {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setSpecificationFields([]);
    setShowForm(true);
  }

  function openEditForm(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description ?? '');
    setSpecificationFields(category.specificationFields?.map((field) => ({
      key: field.key,
      label: field.label,
      type: field.type,
      required: field.required !== false,
      unit: field.unit ?? '',
    })) ?? []);
    setShowForm(true);
  }

  function addSpecificationField() {
    setSpecificationFields((fields) => [...fields, {
      key: '',
      label: '',
      type: 'text',
      required: true,
      unit: '',
    }]);
  }

  function updateSpecificationField(
    index: number,
    update: Partial<SpecificationFieldDraft>,
  ) {
    setSpecificationFields((fields) => fields.map((field, fieldIndex) =>
      fieldIndex === index ? { ...field, ...update } : field,
    ));
  }

  async function deleteCategory(category: Category) {
    if (!window.confirm(`Delete the "${category.name}" category?`)) return;
    setError('');
    try {
      await apiRequest(`/categories/${category._id}`, { method: 'DELETE' });
      setCategories((current) => current.filter((item) => item._id !== category._id));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not delete category.'); }
  }

  return <>
    <PageHeading eyebrow="CATALOG" title="Categories" description="Organize your catalog and define product attributes."
      action={user?.role === 'admin' && <button className="button button-primary" onClick={openCreateForm}><span>＋</span> Add category</button>} />
    {error && <Notice>{error}</Notice>}
    {showForm && user?.role === 'admin' && <section className="panel form-panel">
      <SectionTitle
        title={editingCategory ? `Edit ${editingCategory.name}` : 'New category'}
        description="Define the specification fields that product variants in this category must provide."
      />
      <form className="form-grid" onSubmit={createCategory}>
        <label>Category name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Lighting" /></label>
        <label className="span-two">Description<input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A short description (optional)" /></label>
        <div className="specification-editor span-two">
          <div className="specification-editor-heading">
            <div><strong>Product specifications</strong><small>These fields describe variants, such as size, color, or capacity.</small></div>
            <button type="button" className="button button-secondary" onClick={addSpecificationField}>＋ Add specification</button>
          </div>
          {specificationFields.length === 0 ? (
            <div className="specification-empty">No specification fields yet. Add fields so products in this category can capture variant details.</div>
          ) : specificationFields.map((field, index) => (
            <div className="specification-row" key={index}>
              <label>Field key<input required pattern="[a-zA-Z][a-zA-Z0-9_]*" title="Start with a letter; use only letters, numbers, and underscores." value={field.key} onChange={(event) => updateSpecificationField(index, { key: event.target.value })} placeholder="e.g. color" /></label>
              <label>Display label<input required value={field.label} onChange={(event) => updateSpecificationField(index, { label: event.target.value })} placeholder="e.g. Color" /></label>
              <label>Type<select value={field.type} onChange={(event) => updateSpecificationField(index, { type: event.target.value as CategorySpecificationField['type'] })}><option value="text">Text</option><option value="number">Number</option><option value="dimensions">Dimensions</option></select></label>
              <label>Unit <span className="optional">Optional</span><input value={field.unit ?? ''} onChange={(event) => updateSpecificationField(index, { unit: event.target.value })} placeholder="e.g. cm" /></label>
              <label className="specification-required"><input type="checkbox" checked={field.required !== false} onChange={(event) => updateSpecificationField(index, { required: event.target.checked })} /> Required</label>
              <button type="button" className="icon-button danger-button specification-remove" aria-label={`Remove ${field.label || 'specification field'}`} onClick={() => setSpecificationFields((fields) => fields.filter((_, fieldIndex) => fieldIndex !== index))}>×</button>
            </div>
          ))}
        </div>
        <div className="form-actions span-two"><button type="button" className="button button-secondary" onClick={() => { setShowForm(false); setEditingCategory(null); }}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : editingCategory ? 'Save category' : 'Create category'}</button></div>
      </form>
    </section>}
    <section className="panel">
      <div className="section-title section-title-spaced"><div><h2>All categories</h2><p>{categories.length} catalog groups</p></div><input className="search-input" aria-label="Search categories" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a category…" /></div>
      {loading ? <div className="loading-state">Loading categories…</div> : filtered.length ? <div className="category-grid">
        {filtered.map((category, index) => <article key={category._id} className="category-card">
          <div className={`category-symbol category-color-${index % 4}`}>◈</div>
          <div className="category-card-top"><div><h3>{category.name}</h3><p>{category.description || 'No description added'}</p></div>
            {user?.role === 'admin' && <div className="category-actions"><button className="icon-button" title="Edit category specifications" onClick={() => openEditForm(category)}>✎</button><button className="icon-button danger-button" title="Delete category" onClick={() => void deleteCategory(category)}>×</button></div>}</div>
          <div className="category-meta"><span>{category.specificationFields?.length ?? 0} product specifications</span><span className="category-arrow">↗</span></div>
          {!!category.specificationFields?.length && <div className="category-spec-tags">{category.specificationFields.map((field) => <span key={field.key}>{field.label}{field.required === false ? ' · optional' : ''}</span>)}</div>}
        </article>)}
      </div> : <EmptyState>{search ? 'No categories match your search.' : 'No categories yet. Add one to organize your catalog.'}</EmptyState>}
    </section>
  </>;
}
