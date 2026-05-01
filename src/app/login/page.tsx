'use client';

// LOGIN TEMPORARILY DISABLED — redirects straight to dashboard
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/inicio'); }, [router]);
  return null;
}
