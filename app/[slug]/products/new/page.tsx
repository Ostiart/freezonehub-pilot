'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

type Variant = { type: 'COLOR' | 'TEXTURE'; label: string; colorHex?: string; photoUrl?: string };

export default function NewProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ownerToken = searchParams.get('ownerToken') ?? '';

  const [form, setForm] = useState({
    name: '',
    masterRef: '',
    moqLabel: '',
    packingLabel: '',
    priceMode: 'quote',
    priceValue: '',
    isExclusive: false,
  });
  const [variants, setVariants] = useState<Variant[]>([{ type: 'COLOR', label: '', colorHex: '#059669', photoUrl: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function updateVariant(i: number, patch: Partial<Variant>) {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/companies/${slug}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ownerToken, variants: variants.filter((v) => v.label) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
      router.push(`/${slug}?ownerToken=${ownerToken}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <p style={{ fontSize: 18, fontWeight: 600, margin: '20px 0 20px' }}>Add a product</p>

      <form onSubmit={handleSubmit}>
        <label>Product name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Polo Ice Cotton Lycra" />

        <label>Reference (optional)</label>
        <input value={form.masterRef} onChange={(e) => setForm({ ...form, masterRef: e.target.value })} placeholder="e.g. CWP 100405" />

        <label>MOQ (optional)</label>
        <input value={form.moqLabel} onChange={(e) => setForm({ ...form, moqLabel: e.target.value })} placeholder="e.g. 4 dozen / carton" />

        <label>Size assortment / packing (optional)</label>
        <input value={form.packingLabel} onChange={(e) => setForm({ ...form, packingLabel: e.target.value })} placeholder="e.g. Assorted dozen: sizes 35-40" />

        <label>Price</label>
        <select value={form.priceMode} onChange={(e) => setForm({ ...form, priceMode: e.target.value })}>
          <option value="quote">Ask for quote</option>
          <option value="fixed">Show a fixed price</option>
        </select>
        {form.priceMode === 'fixed' && (
          <input type="number" value={form.priceValue} onChange={(e) => setForm({ ...form, priceValue: e.target.value })} placeholder="e.g. 45" />
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <input type="checkbox" style={{ width: 'auto', marginBottom: 0 }} checked={form.isExclusive} onChange={(e) => setForm({ ...form, isExclusive: e.target.checked })} />
          Exclusive — only visible to buyers you invite directly
        </label>

        <p style={{ fontSize: 12, fontWeight: 600, margin: '4px 0 8px' }}>Variants (color or texture)</p>
        {variants.map((v, i) => (
          <div key={i} className="card" style={{ marginBottom: 10 }}>
            <select value={v.type} onChange={(e) => updateVariant(i, { type: e.target.value as 'COLOR' | 'TEXTURE' })}>
              <option value="COLOR">Color</option>
              <option value="TEXTURE">Texture / print</option>
            </select>
            <input value={v.label} onChange={(e) => updateVariant(i, { label: e.target.value })} placeholder="e.g. Rose gold, Camo print" />
            {v.type === 'COLOR' && (
              <input type="color" value={v.colorHex} onChange={(e) => updateVariant(i, { colorHex: e.target.value })} style={{ height: 40 }} />
            )}
            <input value={v.photoUrl} onChange={(e) => updateVariant(i, { photoUrl: e.target.value })} placeholder="Photo URL (paste an image link)" />
          </div>
        ))}
        <button type="button" className="button-secondary" style={{ marginBottom: 16 }} onClick={() => setVariants([...variants, { type: 'COLOR', label: '', colorHex: '#059669', photoUrl: '' }])}>
          + Add another variant
        </button>

        {error && <p style={{ color: '#9B1C1C', fontSize: 12, marginBottom: 12 }}>{error}</p>}

        <button className="button-primary" type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Save product'}
        </button>
      </form>
    </div>
  );
}
