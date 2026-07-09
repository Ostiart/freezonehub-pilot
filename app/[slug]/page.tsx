'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  function handleCarouselScroll() {
    const el = carouselRef.current;
    if (!el) return;
    setActiveSlide(Math.round(el.scrollLeft / el.clientWidth));
  }

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
  const photos: string[] = company.businessPhotos ?? [];
  const initials = company.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase())
    .join('');

  return (
    <div className="container">
      {welcome && (
        <div className="card" style={{ background: 'var(--badge-green-bg)', border: 'none', marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: 'var(--badge-green-text)', margin: 0, fontWeight: 600 }}>
            Your showroom is live. Bookmark this exact link — it's the only way you can edit it.
          </p>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="carousel-scroll"
          style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', height: 140, borderRadius: 16 }}
        >
          {photos.length > 0 ? (
            photos.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`${company.name} ${i + 1}`}
                style={{ minWidth: '100%', height: '100%', objectFit: 'cover', scrollSnapAlign: 'start' }}
              />
            ))
          ) : (
            <div style={{ minWidth: '100%', height: '100%', scrollSnapAlign: 'start', background: 'linear-gradient(135deg, #059669, #03332a)' }} />
          )}
        </div>

        {photos.length > 1 && (
          <span
            style={{
              position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)', color: '#fff',
              fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20,
            }}
          >
            {activeSlide + 1}/{photos.length}
          </span>
        )}

        {photos.length > 1 && (
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
            {photos.map((_, i) => (
              <div
                key={i}
                style={{ width: 6, height: 6, borderRadius: '50%', background: i === activeSlide ? '#fff' : 'rgba(255,255,255,0.5)' }}
              />
            ))}
          </div>
        )}

        <div
          style={{
            position: 'absolute', bottom: -28, left: 16, width: 56, height: 56, borderRadius: '50%',
            background: '#fff', border: '3px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{initials}</span>
        </div>
      </div>

      <div style={{ marginTop: 34, marginBottom: 6 }}>
        <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{company.name}</p>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', margin: '5px 0 0' }}>
          {company.isVerified && (
            <span className="badge" style={{ background: 'var(--badge-green-bg)', color: 'var(--badge-green-text)' }}>
              Verified supplier
            </span>
          )}
          <span className="badge" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '0.5px solid var(--border)' }}>
            {company.visibility === 'PRIVATE' ? 'Private' : 'Public'}
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '6px 0 0' }}>
          {company.category}{company.foundedYear ? ` · Est. ${company.foundedYear}` : ''}
        </p>
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
