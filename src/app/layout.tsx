import type { Metadata } from 'next';
import { Baloo_2, Nunito_Sans } from 'next/font/google';
import './globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import AppProviders from '@/components/providers/AppProviders';
import AppShell from '@/components/layout/AppShell';
import { SCRIPT_PALETA } from '@/lib/paletas';

const display = Baloo_2({ variable: '--font-display', subsets: ['latin'], weight: ['600', '800'], display: 'swap' });
const body = Nunito_Sans({ variable: '--font-body', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'MediSystem', template: '%s | MediSystem' },
  description: 'Sistema de gestión médica profesional',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // La paleta se aplica en el cliente antes de hidratar: el atributo difiere del servidor a propósito.
    <html lang="es" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_PALETA }} />
      </head>
      <body>
        <AppRouterCacheProvider>
          <AppProviders>
            <AppShell>{children}</AppShell>
          </AppProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
