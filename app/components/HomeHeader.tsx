import Link from 'next/link';

export function HomeHeader() {
  return (
    <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', margin: '0 0 16px' }}>FreeZoneHub</p>
    </Link>
  );
}
