'use client';

import { useEffect, useState } from 'react';

/** Cuenta de 0 al valor al aparecer; da vida a los números sin distraer. */
export function useConteo(valor: number, duracionMs = 900): number {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    let cuadro = 0;
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const inicio = performance.now();

    const paso = (ahora: number) => {
      const t = sinMovimiento ? 1 : Math.min(1, (ahora - inicio) / duracionMs);
      setActual(Math.round(valor * (1 - Math.pow(1 - t, 3))));
      if (t < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [valor, duracionMs]);

  return actual;
}
