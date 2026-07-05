import './globals.css';

export const metadata = {
  title: 'FreeZoneHub',
  description: 'Smart Trade Starts Here',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
