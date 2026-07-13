'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HomeHeader } from '@/app/components/HomeHeader';

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    category: '',
    whatsappNumber: '',
    foundedYear: '',
    visibility: 'PUBLIC',
  });
  const [businessPhotos, setBusinessPhotos] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');

  function updateBusinessPhoto(i: number, value: string) {
    setBusinessPhotos((prev) => prev.map((url, idx) => (idx === i ? value : url)));
  }

  async function submitCompany(confirmDuplicate: boolean) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, businessPhotos: businessPhotos.filter((url) => url.trim()), confirmDuplicate }),
      });
      const data = await res.json();
      if (res.status === 409 && data.warning === 'duplicate') {
        setDuplicateWarning(data.message);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
      // Save the owner token locally so this device can keep editing the showroom
      localStorage.setItem(`fzh_owner_${data.slug}`, data.ownerToken);
      router.push(`/${data.slug}?ownerToken=${data.ownerToken}&welcome=1`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDuplicateWarning('');
    await submitCompany(false);
  }

  return (
    <div className="container">
      <HomeHeader />
      <p style={{ fontSize: 18, fontWeight: 600, margin: '20px 0 4px' }}>Create your free showroom</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 20px' }}>
        Replace your PDF catalog with a link you can share with your buyers today.
      </p>

      <form onSubmit={handleSubmit}>
        <label>Company name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Acme Trading Co." />

        <label>Category</label>
        <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Clothing, Footwear, Electronics" />

        <label>WhatsApp Business number (with country code)</label>
        <input value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} placeholder="e.g. +1 555 000 0000" />

        <label>Founded year (optional)</label>
        <input value={form.foundedYear} onChange={(e) => setForm({ ...form, foundedYear: e.target.value })} placeholder="e.g. 2005" />

        <label>Showroom visibility</label>
        <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
          <option value="PUBLIC">Public — anyone with the link can view</option>
          <option value="PRIVATE">Private — only you, via your owner link</option>
        </select>

        <p style={{ fontSize: 12, fontWeight: 600, margin: '4px 0 8px' }}>
          Fotos de tu local o sala de ventas (opcional, recomendado mínimo 6)
        </p>
        {businessPhotos.map((url, i) => (
          <input
            key={i}
            value={url}
            onChange={(e) => updateBusinessPhoto(i, e.target.value)}
            placeholder="Photo URL (paste an image link)"
          />
        ))}
        <button
          type="button"
          className="button-secondary"
          style={{ marginBottom: 16 }}
          onClick={() => setBusinessPhotos([...businessPhotos, ''])}
        >
          + Agregar otra foto
        </button>

        {error && <p style={{ color: '#9B1C1C', fontSize: 12, marginBottom: 12 }}>{error}</p>}

        {duplicateWarning && (
          <div className="card" style={{ background: 'var(--badge-exclusive-bg, #FEF3C7)', border: 'none', marginBottom: 12 }}>
            <p style={{ fontSize: 12, margin: '0 0 8px' }}>{duplicateWarning}</p>
            <button
              type="button"
              className="button-secondary"
              onClick={() => submitCompany(true)}
              disabled={loading}
            >
              Crear de todas formas
            </button>
          </div>
        )}

        <button className="button-primary" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create showroom'}
        </button>
      </form>
    </div>
  );
}
