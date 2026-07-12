'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

export default function NewAdvisorPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ownerToken = searchParams.get('ownerToken') ?? '';

  const [form, setForm] = useState({
    name: '',
    whatsappNumber: '',
    paramSlug: '',
    photoUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/companies/${slug}/advisors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ownerToken }),
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
      <p style={{ fontSize: 18, fontWeight: 600, margin: '20px 0 4px' }}>Add a vendedor/asesor</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 20px' }}>
        Cada vendedor recibe su propio link. Ejemplo: si el slug es "juan", el link será freezonehub.com/{slug}?vendedor=juan — cuando un comprador entra por ese link, el botón de WhatsApp lo conecta directamente con este vendedor.
      </p>

      <form onSubmit={handleSubmit}>
        <label>Nombre del vendedor</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Juan Pérez" />

        <label>WhatsApp del vendedor (con código de país)</label>
        <input required value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} placeholder="e.g. +1 555 000 0000" />

        <label>Slug para el link (ej. "juan")</label>
        <input
          required
          value={form.paramSlug}
          onChange={(e) => setForm({ ...form, paramSlug: e.target.value })}
          placeholder="e.g. juan"
        />
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '-8px 0 12px' }}>
          Será parte del link: freezonehub.com/{slug}?vendedor={form.paramSlug || '...'}
        </p>

        <label>URL de la foto (opcional)</label>
        <input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} placeholder="Photo URL (paste an image link)" />

        {error && <p style={{ color: '#9B1C1C', fontSize: 12, marginBottom: 12 }}>{error}</p>}

        <button className="button-primary" type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Save advisor'}
        </button>
      </form>
    </div>
  );
}
