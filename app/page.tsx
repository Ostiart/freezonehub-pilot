import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--primary)', margin: 0 }}>FreeZoneHub</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 40px' }}>Smart Trade Starts Here</p>
      <Link href="/onboarding" className="button-primary" style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}>
        Create your free showroom
      </Link>
    </div>
  );
}
