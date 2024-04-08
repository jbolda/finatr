import Big from 'big.js';

import { schema } from '../schema';
import makeUUID from '../utils/makeUUID.ts';
import { thunks } from './foundation.ts';

export const addIncomeReceived = thunks.create(
  'incomeReceived:add',
  function* (ctx, next) {
    const income = { ...ctx.payload };
    if (!income?.id) income.id = makeUUID();

    const incomeBigged = Object.entries(income).reduce(
      (bigged, [key, value]) => {
        bigged[key] = typeof value === 'number' ? Big(value) : value;
        return bigged;
      },
      {}
    );
    yield* schema.update(
      schema.incomeReceived.add({ [income.id]: incomeBigged })
    );
    yield* next();
  }
);

export const addIncomeExpected = thunks.create(
  'incomeExpected:add',
  function* (ctx, next) {
    const income = { ...ctx.payload };
    if (!income?.id) income.id = makeUUID();

    yield* schema.update(schema.incomeExpected.add({ [income.id]: income }));
    yield* next();
  }
);
