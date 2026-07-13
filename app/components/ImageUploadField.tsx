'use client';

import { useState } from 'react';
import { cropToSquare } from '@/lib/cropImage';

export function ImageUploadField({
  value,
  onChange,
  ownerToken,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  ownerToken: string;
  label?: string;
}) {
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const cropped = await cropToSquare(file, 1000);
      const formData = new FormData();
      formData.append('file', cropped, 'photo.jpg');
      formData.append('ownerToken', ownerToken);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error ?? `Upload failed (${res.status})`);
      onChange(data.url);
    } catch (err: any) {
      setError(err.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  const displayUrl = preview || value;

  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label>{label}</label>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {displayUrl && (
          <img
            src={displayUrl}
            alt="Preview"
            style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: '0.5px solid var(--border)', flexShrink: 0 }}
          />
        )}
        <div style={{ flex: 1 }}>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginBottom: 0 }} />
          {uploading && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0' }}>Subiendo…</p>}
          {error && <p style={{ fontSize: 11, color: '#9B1C1C', margin: '4px 0 0' }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}
