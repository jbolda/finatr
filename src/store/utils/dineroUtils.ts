import { TransformerOptions } from '@dinero.js/core';
import { USD, type Currency } from '@dinero.js/currencies';
import { dinero, toDecimal, type Dinero, type DineroOptions } from 'dinero.js';

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

export function redinero(
  value: Dinero<number> | DineroOptions<number> | number
): Dinero<number> {
  if (value === null || value === undefined)
    throw new Error(`value is ${value}`);
  if (typeof value === 'number') {
    return dineroFromFloat({ amount: value, currency: USD });
  } else if (typeof value === 'object' && 'amount' in value) {
    return dinero(value);
  }
  return value;
}

// This function lets you pass a transformer and rounding options.
// It returns a function that takes a Dinero object and applies
// the closured transformer.
function createFormatter(transformer: {
  ({ value, currency }: { value: number; currency: Currency<number> }): string;
  (options: TransformerOptions<number, string>): string;
}) {
  return function formatter(dineroObject: Dinero<number>) {
    return toDecimal(dineroObject, transformer);
  };
}

// This function is reusable to format any Dinero object
// with the same transformer.
export const toHumanCurrency = createFormatter(
  ({ value, currency }) =>
    `${currency.code === 'USD' ? '$' : `${currency.code} `}${value}`
);
