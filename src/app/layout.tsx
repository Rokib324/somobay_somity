import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Somity Online - Co-operative ERP System',
  description: 'Enterprise Co-operative Management System for Savings, Loans, Accounts, and HR',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
