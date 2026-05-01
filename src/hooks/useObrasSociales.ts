'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProviders, getInsuranceProviders, getLatestAgreement } from '@/lib/firestore/obras-sociales';
import type { InsuranceProvider, PricingAgreement } from '@/lib/types';

export function useUserProviders() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setCargando(true);
      setError(null);
      try {
        // Try user-specific providers first; fall back to all active providers
        const [userP, allP] = await Promise.all([
          user ? getUserProviders(user.uid) : Promise.resolve([]),
          getInsuranceProviders(),
        ]);
        if (!cancelled) setProviders(userP.length > 0 ? userP : allP);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setCargando(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  return { providers, cargando, error };
}

export function usePricing(providerId: string | null) {
  const [agreement, setAgreement] = useState<PricingAgreement | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) { setAgreement(null); return; }
    let cancelled = false;
    setCargando(true);
    setError(null);
    getLatestAgreement(providerId)
      .then((a) => { if (!cancelled) setAgreement(a); })
      .catch((e) => { if (!cancelled) setError((e as Error).message); })
      .finally(() => { if (!cancelled) setCargando(false); });
    return () => { cancelled = true; };
  }, [providerId]);

  return { agreement, cargando, error };
}
