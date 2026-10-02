import {
  collection, doc, getDocs, getDoc, query, where, orderBy,
} from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { toIsoOpcional } from './repository';
import type { InsuranceProvider, PricingAgreement } from '../types';

const PROVIDERS_COL = 'insurance_providers';
const USER_PROVIDERS_COL = 'user_providers';
const AGREEMENTS_COL = 'pricing_agreements';


export async function getInsuranceProviders(): Promise<InsuranceProvider[]> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), PROVIDERS_COL), where('activa', '==', true), orderBy('nombre'))
  );
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    creadoEn: toIsoOpcional(d.data().creadoEn),
  } as InsuranceProvider));
}

export async function getUserProviders(uid: string): Promise<InsuranceProvider[]> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), USER_PROVIDERS_COL), where('uid', '==', uid))
  );
  if (snap.empty) return [];
  const providerIds = snap.docs.map((d) => d.data().providerId as string);
  const providers = await Promise.all(
    providerIds.map(async (id) => {
      const docSnap = await getDoc(doc(getFirebaseDb(), PROVIDERS_COL, id));
      if (!docSnap.exists()) return null;
      return { ...docSnap.data(), id: docSnap.id, creadoEn: toIsoOpcional(docSnap.data().creadoEn) } as InsuranceProvider;
    })
  );
  return providers.filter((p): p is InsuranceProvider => p !== null);
}

export async function getLatestAgreement(providerId: string): Promise<PricingAgreement | null> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), AGREEMENTS_COL),
      where('providerId', '==', providerId),
      orderBy('vigenciaDesde', 'desc')
    )
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { ...d.data(), id: d.id, creadoEn: toIsoOpcional(d.data().creadoEn) } as PricingAgreement;
}
