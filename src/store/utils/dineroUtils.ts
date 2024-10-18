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

export function floatFromDinero(d: Dinero<number>) {
  return parseFloat(toDecimal(d));
}

export function scaledFromFloat(value: number, scale: number) {
  const factor = 10 ** scale;
  const amount = Math.round(value * factor);

  return { amount, scale: -scale };
}

export function floatFromScaled(
  {
    amount,
    scale
  }: {
    amount: number;
    scale: number;
  },
  additionalScale?: number
) {
  const factor = Math.pow(10, scale + (additionalScale ?? 0));
  const floated = amount * factor;
  console.log({ floated, amount, scale, factor, m: amount * factor });
  return floated;
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

// This function is reusable to format any simple amount / scale object
export const toHumanInterest = ({
  amount,
  scale,
  leadingSymbol = '',
  trailingSymbol = ''
}: {
  amount: number;
  scale: number;
  leadingSymbol?: string;
  trailingSymbol?: string;
}) => {
  if (amount === 0) return `${leadingSymbol}0${trailingSymbol}`;
  const stringifiedArray = amount.toString().split('');
  // apply operations backwards
  stringifiedArray.reverse();
  stringifiedArray.splice(-scale - 2, 0, '.');

  // remove trailing zeros
  let trailingZeros = 0;
  for (let v of stringifiedArray) {
    if (v === '0' || v === '.') {
      trailingZeros++;
    } else {
      break;
    }
  }
  const finalStringArray = stringifiedArray.slice(trailingZeros).reverse();
  if (finalStringArray[0] === '.') finalStringArray.splice(0, 0, '0');

  // add symbols to final string
  finalStringArray.splice(0, 0, leadingSymbol);
  finalStringArray.push(trailingSymbol);
  console.log(finalStringArray);
  return finalStringArray.join('');
};
