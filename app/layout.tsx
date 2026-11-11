import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PocketDrop',
  description: 'Create premium local product listings and sell instantly.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
