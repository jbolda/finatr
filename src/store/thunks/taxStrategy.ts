import { USD } from '@dinero.js/currencies';
import { dinero } from 'dinero.js';

import { schema } from '../schema';
import makeUUID from '../utils/makeUUID.ts';
import { thunks } from './foundation.ts';

export const addIncomeReceived = thunks.create(
  'incomeReceived:add',
  function* (ctx, next) {
    const income = { ...ctx.payload };
    if (!income?.id) income.id = makeUUID();

    const incomeDineroed = Object.entries(income).reduce(
      (dineroed, [key, value]) => {
        dineroed[key] =
          typeof value === 'number'
            ? dinero({ amount: value, currency: USD })
            : value;
        return dineroed;
      },
      {}
    );
    yield* schema.update(
      schema.incomeReceived.add({ [income.id]: incomeDineroed })
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
