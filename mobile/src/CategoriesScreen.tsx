import { useEffect, useState } from 'react';
import { Alert, Modal, Text, View } from 'react-native';
import { apiRequest, jsonBody } from './api';
import type { Category, SpecificationField } from './types';
import { Button, Card, Empty, Field, Notice, Page, SectionTitle, SelectField, colors } from './ui';

function blankField(): SpecificationField {
  return { key: '', label: '', type: 'text', required: true, unit: '' };
}

export function CategoriesScreen({ isAdmin }: { isAdmin: boolean }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<SpecificationField[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    try { setCategories(await apiRequest<Category[]>('/categories')); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load categories.'); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    apiRequest<Category[]>('/categories')
      .then(setCategories)
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  function create() {
    setEditing(null);
    setName('');
    setDescription('');
    setFields([]);
    setError('');
    setEditor(true);
  }

  function edit(category: Category) {
    setEditing(category);
    setName(category.name);
    setDescription(category.description ?? '');
    setFields(category.specificationFields?.map((field) => ({ ...field })) ?? []);
    setError('');
    setEditor(true);
  }

  async function save() {
    const keys = fields.map((field) => field.key.trim().toLowerCase());
    if (!name.trim() || fields.some((field) => !field.key.trim() || !field.label.trim()) ||
      new Set(keys).size !== keys.length ||
      keys.some((key) => !/^[a-z][a-z0-9_]*$/.test(key))) {
      setError('Provide a category name and unique valid keys and labels for all specification fields.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const body = {
        name: name.trim(),
        description,
        specificationFields: fields.map((field) => ({
          ...field,
          key: field.key.trim(),
          label: field.label.trim(),
          unit: field.unit?.trim() ?? '',
        })),
      };
      await apiRequest(editing ? `/categories/${editing._id}` : '/categories', {
        method: editing ? 'PATCH' : 'POST',
        body: jsonBody(body),
      });
      setEditor(false);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save category.');
    } finally {
      setBusy(false);
    }
  }

  function remove(category: Category) {
    Alert.alert('Delete category?', `Delete "${category.name}"? Categories used by products cannot be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        void apiRequest(`/categories/${category._id}`, { method: 'DELETE' })
          .then(() => setCategories((current) => current.filter((item) => item._id !== category._id)))
          .catch((cause: Error) => setError(cause.message));
      } },
    ]);
  }

  return (
    <Page title="Categories" subtitle="Organize products and define their variant specifications."
      action={isAdmin ? <Button title="+ Add" onPress={create} small /> : undefined}>
      {error ? <Notice>{error}</Notice> : null}
      {loading ? <Card><Empty>Loading categories…</Empty></Card> : categories.length ? categories.map((category) => (
        <Card key={category._id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.ink, fontSize: 14, fontWeight: '800' }}>{category.name}</Text>
              <Text style={{ color: colors.muted, fontSize: 10, marginTop: 4 }}>{category.description || 'No description'}</Text>
            </View>
            {isAdmin ? <View style={{ flexDirection: 'row', gap: 6 }}>
              <Button title="Edit" secondary small onPress={() => edit(category)} />
              <Button title="Delete" danger small onPress={() => remove(category)} />
            </View> : null}
          </View>
          <SectionTitle>Specifications ({category.specificationFields?.length ?? 0})</SectionTitle>
          {category.specificationFields?.length ? category.specificationFields.map((field) => (
            <Text key={field.key} style={{ color: '#66778d', fontSize: 10 }}>
              • {field.label} · {field.type}{field.unit ? ` · ${field.unit}` : ''}{field.required === false ? ' · optional' : ' · required'}
            </Text>
          )) : <Text style={{ color: colors.muted, fontSize: 10 }}>No variant specifications defined.</Text>}
        </Card>
      )) : <Card><Empty>Create a category before adding products.</Empty></Card>}

      <Modal visible={editor} animationType="slide" onRequestClose={() => setEditor(false)}>
        <Page title={editing ? 'Edit category' : 'New category'} subtitle="Specification fields are used when entering each product variant.">
          {error ? <Notice>{error}</Notice> : null}
          <Field label="Category name" value={name} onChangeText={setName} required />
          <Field label="Description" value={description} onChangeText={setDescription} />
          <SectionTitle>Specification fields</SectionTitle>
          <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 15 }}>Define the attributes each product variant should have, such as color, size, weight, or dimensions.</Text>
          {fields.map((field, index) => (
            <Card key={index}>
              <Field label="Field key (letters, numbers, underscores)" value={field.key} onChangeText={(key) => setFields((current) => current.map((item, at) => at === index ? { ...item, key } : item))} placeholder="e.g. color" required autoCapitalize="none" />
              <Field label="Display label" value={field.label} onChangeText={(label) => setFields((current) => current.map((item, at) => at === index ? { ...item, label } : item))} placeholder="e.g. Color" required />
              <SelectField label="Value type" value={field.type} options={[
                { label: 'Text', value: 'text' },
                { label: 'Number', value: 'number' },
                { label: 'Dimensions', value: 'dimensions' },
              ]} onChange={(type) => setFields((current) => current.map((item, at) => at === index ? { ...item, type: type as SpecificationField['type'] } : item))} />
              <Field label="Unit (optional)" value={field.unit ?? ''} onChangeText={(unit) => setFields((current) => current.map((item, at) => at === index ? { ...item, unit } : item))} placeholder="e.g. cm" />
              <SelectField label="Required" value={field.required === false ? 'optional' : 'required'} options={[
                { label: 'Required', value: 'required' },
                { label: 'Optional', value: 'optional' },
              ]} onChange={(value) => setFields((current) => current.map((item, at) => at === index ? { ...item, required: value === 'required' } : item))} />
              <Button title="Remove specification" danger small onPress={() => setFields((current) => current.filter((_, at) => at !== index))} />
            </Card>
          ))}
          <Button title="+ Add specification" secondary onPress={() => setFields((current) => [...current, blankField()])} />
          {editing ? <Notice>Backend validation protects existing products. Specification changes that invalidate a variant will be rejected.</Notice> : null}
          <Button title={busy ? 'Saving…' : editing ? 'Save category' : 'Create category'} onPress={() => void save()} disabled={busy} />
          <Button title="Cancel" secondary onPress={() => setEditor(false)} />
        </Page>
      </Modal>
    </Page>
  );
}
