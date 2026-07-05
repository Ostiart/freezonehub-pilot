'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';

export default function ShowroomPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const [company, setCompany] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [notFound, setNotFound] = useState(false);
  const ownerTokenFromUrl = searchParams.get('ownerToken');
  const welcome = searchParams.get('welcome') === '1';

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem(`fzh_owner_${slug}`) : null;
    const ownerToken = ownerTokenFromUrl ?? storedToken;

    fetch(`/api/companies/${slug}${ownerToken ? `?ownerToken=${ownerToken}` : ''}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => {
        setCompany({ ...data, ownerTokenParam: ownerToken });
        if (typeof window !== 'undefined') {
          const shareUrl = `${window.location.origin}/${slug}`;
          QRCode.toDataURL(shareUrl, { margin: 1, color: { dark: '#03332A', light: '#F0FAF6' } }).then(setQrDataUrl);
        }
      })
      .catch(() => setNotFound(true));
  }, [slug, ownerTokenFromUrl]);

  if (notFound) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <p style={{ fontSize: 15, fontWeight: 600 }}>Showroom not found</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>This link is private or doesn't exist.</p>
      </div>
    );
  }

  if (!company) return <div className="container">Loading…</div>;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : '';
  const waLink = company.whatsappNumber
    ? `https://wa.me/${company.whatsappNumber.replace(/[^0-9]/g, '')}`
    : null;

  return (
    <div className="container">
      {welcome && (
        <div className="card" style={{ background: 'var(--badge-green-bg)', border: 'none', marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: 'var(--badge-green-text)', margin: 0, fontWeight: 600 }}>
            Your showroom is live. Bookmark this exact link — it's the only way you can edit it.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{company.name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
            {company.category}{company.foundedYear ? ` · Est. ${company.foundedYear}` : ''}
          </p>
        </div>
        {company.isVerified && <span className="badge" style={{ background: 'var(--badge-green-bg)', color: 'var(--badge-green-text)' }}>Verified</span>}
      </div>

      <div style={{ display: 'flex', gap: 8, margin: '14px 0 18px' }}>
        {waLink && (
          <a href={waLink} target="_blank" className="button-primary" style={{ textDecoration: 'none', textAlign: 'center', background: '#25D366' }}>
            WhatsApp
          </a>
        )}
        {company.isOwner && (
          <Link href={`/${slug}/products/new?ownerToken=${company.ownerTokenParam}`} className="button-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
            + Add product
          </Link>
        )}
      </div>

      <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 10px' }}>Products ({company.products.length})</p>
      {company.products.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No products yet — this is what your buyers will see once you add some.</p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {company.products.map((p: any) => (
          <div key={p.id} className="card">
            {p.isExclusive && <span className="badge" style={{ background: 'var(--badge-exclusive-bg)', color: 'var(--badge-exclusive-text)', marginBottom: 6 }}>Exclusive</span>}
            <div style={{ height: 70, background: 'var(--bg)', borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {p.variants[0]?.photoUrl ? (
                <img src={p.variants[0].photoUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>No photo</span>
              )}
            </div>
            <p style={{ fontSize: 12, fontWeight: 500, margin: 0 }}>{p.name}</p>
            {p.moqLabel && <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '2px 0 0' }}>MOQ {p.moqLabel}</p>}
            {p.packingLabel && <p style={{ fontSize: 9, color: 'var(--text-muted)', margin: '2px 0 0' }}>{p.packingLabel}</p>}
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--primary)', margin: '4px 0 0' }}>
              {p.priceMode === 'fixed' && p.priceValue ? `$${p.priceValue}` : 'Ask for quote'}
            </p>
            {p.variants.length > 0 && (
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                {p.variants.map((v: any) => (
                  v.type === 'COLOR'
                    ? <div key={v.id} title={v.label} style={{ width: 14, height: 14, borderRadius: '50%', background: v.colorHex || '#ccc', border: '1px solid var(--border)' }} />
                    : <div key={v.id} title={v.label} style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--bg)', border: '1px solid var(--border)' }} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 600, margin: '0 0 10px' }}>Share this showroom</p>
        {qrDataUrl && <img src={qrDataUrl} alt="Showroom QR code" style={{ width: 140, height: 140, margin: '0 auto 10px' }} />}
        <p style={{ fontSize: 11, color: 'var(--text-muted)', wordBreak: 'break-all', margin: 0 }}>{shareUrl}</p>
      </div>
    </div>
  );
}
