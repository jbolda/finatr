import type { Currency } from '@dinero.js/currencies';
import { dinero } from 'dinero.js';

export function dineroFromFloat({
  amount: float,
  currency,
  scale
}: {
  amount: number;
  currency: Currency<number>;
  scale?: number;
}) {
  // eventually need to consider base can be an array
  const base = currency.base as number;
  const factor = base ** (scale || currency.exponent);
  const amount = Math.round(float * factor);

  return dinero({ amount, currency, scale });
}
