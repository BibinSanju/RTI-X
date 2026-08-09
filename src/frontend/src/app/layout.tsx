import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Tamil } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  variable: '--font-noto-tamil',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'RTI-GPT — File Your Right to Information Request',
  description:
    'RTI-GPT helps Tamil-speaking citizens draft legally compliant RTI applications in minutes using AI. Built by Team Neural Ninjas for GDG Coimbatore Tech for Good 2026.',
  keywords: ['RTI', 'Right to Information', 'Tamil Nadu', 'Civic Tech', 'RTI application'],
  authors: [{ name: 'Team Neural Ninjas (TEAM-008)' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4f46e5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ta-IN" className={`${inter.variable} ${notoSansTamil.variable}`}>
      <body className="antialiased bg-slate-50 text-slate-900 font-inter">
        {children}
      </body>
    </html>
  );
}
