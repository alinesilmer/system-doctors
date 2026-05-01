import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import AppProviders from '@/components/providers/AppProviders';
import AppShell from '@/components/layout/AppShell';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'MediSystem', template: '%s | MediSystem' },
  description: 'Sistema de gestión médica profesional',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full">
        <AppRouterCacheProvider>
          <AppProviders>
            <AppShell>{children}</AppShell>
          </AppProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
