'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MODO_DEMO } from '@/lib/demo/modo';
import type { InsuranceProvider, PricingAgreement } from '@/lib/types';

// Estas pantallas leen Firestore directo desde el navegador; en modo demo la
// misma interfaz devuelve el catálogo de muestra y Firebase ni se descarga.
async function getUserProviders(uid: string): Promise<InsuranceProvider[]> {
  if (MODO_DEMO) return [];
  return (await import('@/lib/firestore/obras-sociales')).getUserProviders(uid);
}

async function getInsuranceProviders(): Promise<InsuranceProvider[]> {
  if (MODO_DEMO) return (await import('@/lib/demo/datos')).OBRAS_SOCIALES_DEMO;
  return (await import('@/lib/firestore/obras-sociales')).getInsuranceProviders();
}

async function getLatestAgreement(providerId: string): Promise<PricingAgreement | null> {
  if (MODO_DEMO) return (await import('@/lib/demo/datos')).convenioDemo(providerId);
  return (await import('@/lib/firestore/obras-sociales')).getLatestAgreement(providerId);
}

export function useUserProviders() {
  const { perfil } = useAuth();
  const uid = perfil?.uid;
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;

    // Si el usuario no tiene obras sociales vinculadas, mostramos el catálogo completo.
    getUserProviders(uid)
      .then((propias) => (propias.length > 0 ? propias : getInsuranceProviders()))
      .then((resultado) => {
        if (cancelled) return;
        setProviders(resultado);
        setError(null);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setCargando(false);
      });

    return () => { cancelled = true; };
  }, [uid]);

  return { providers, cargando, error };
}

/** Resultado de la última consulta, junto al proveedor al que corresponde. */
interface EstadoPricing {
  para: string | null;
  agreement: PricingAgreement | null;
  error: string | null;
}

const SIN_CONSULTA: EstadoPricing = { para: null, agreement: null, error: null };

export function usePricing(providerId: string | null) {
  const [estado, setEstado] = useState<EstadoPricing>(SIN_CONSULTA);

  useEffect(() => {
    if (!providerId) return;
    let cancelled = false;

    getLatestAgreement(providerId)
      .then((agreement) => {
        if (!cancelled) setEstado({ para: providerId, agreement, error: null });
      })
      .catch((e: Error) => {
        if (!cancelled) setEstado({ para: providerId, agreement: null, error: e.message });
      });

    return () => { cancelled = true; };
  }, [providerId]);

  // Mientras el estado corresponda a otro proveedor, la consulta sigue en curso.
  const alDia = estado.para === providerId;

  return {
    agreement: alDia ? estado.agreement : null,
    cargando: providerId !== null && !alDia,
    error: alDia ? estado.error : null,
  };
}
