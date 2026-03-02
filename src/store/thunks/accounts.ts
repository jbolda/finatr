import { CalendarDate } from '@internationalized/date';
import { parse } from 'date-fns';
import { z } from 'zod';

import {
  loroSchema as schema,
  AccountSchema,
  type AccountInput
} from '../schema/index.ts';
import { thunks } from './foundation.ts';

export const accountAdd = thunks.create<AccountInput>(
  'account:add',
  function* (ctx, next) {
    const account = AccountSchema.safeParse(ctx.payload);
    if (!account.success) {
      console.error(
        'Invalid account payload\n',
        z.prettifyError(account.error)
      );
      throw new Error('Invalid account payload');
    }

    // TODO typings: the generic isn't coming through and is only FxMap
    yield* schema.update(
      schema.accounts.add({ [account.data.id]: account.data }) as any
    );
    yield* next();
  }
);

export const accountRemove = thunks.create<{ id: string }>(
  'account:remove',
  function* (ctx, next) {
    // TODO typings: see comment above about update generic mismatch
    yield* schema.update(schema.accounts.remove([ctx.payload.id]) as any);
    yield* next();
  }
);

export const updateAccountSnapshotDate = thunks.create<CalendarDate | null>(
  'account:snapshot-date-update',
  function* (ctx, next) {
    if (ctx.payload) {
      const dateInput = ctx.payload.toString();
      // store as an ISO-formatted yyyy-MM-dd string to match schema
      const snapshotDate = parse(dateInput, 'yyyy-MM-dd', new Date());
      const formatted = snapshotDate.toISOString().slice(0, 10);

      yield* schema.update(schema.accountMeta.set({ snapshotDate: formatted }));
    }

    yield* next();
  }
);
