'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import PageContainer from '@/components/ui/PageContainer';
import { DISPLAY, bloque } from '@/components/ui/estilos';
import { MAS, type ItemNav } from '@/components/layout/navegacion';
import { useAuth } from '@/contexts/AuthContext';

const ADMIN: ItemNav = { label: 'Admin', href: '/admin', icon: AdminPanelSettingsRoundedIcon };

/** Las secciones que no entran en el dock, como mosaicos grandes. */
export default function MasPage() {
  const { rol } = useAuth();
  const items = rol === 'super_admin' ? [...MAS, ADMIN] : MAS;

  return (
    <PageContainer titulo="Más">
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(10.5rem, 1fr))', gap: 2 }}>
        {items.map(({ label, href, icon: Icon, tono }, i) => (
          <Box
            key={href}
            component={Link}
            href={href}
            className="in"
            style={{ '--n': i + 1 } as React.CSSProperties}
            sx={{
              ...bloque,
              aspectRatio: '1', display: 'grid', placeContent: 'center', justifyItems: 'center', gap: 1, p: 1.5,
              textAlign: 'center', fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.1,
              ...(tono && { backgroundColor: tono, color: 'var(--on-tint)' }),
              '& svg': { fontSize: '3rem', transition: 'transform 0.3s var(--spring)' },
              '&:hover svg': { transform: 'scale(1.2)' },
            }}
          >
            <Icon />
            {label}
          </Box>
        ))}
      </Box>
    </PageContainer>
  );
}
