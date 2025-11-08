import { type Session } from '@supabase/supabase-js';
import { format } from 'date-fns';
import addDays from 'date-fns/fp/addDays/index.js';
import {
  type FxMap,
  type FxSchema,
  type StoreUpdater,
  updateStore,
  slice as sliceOG
} from 'starfx';
import { z } from 'zod';

import { emptyAccount, emptyTransaction } from '../factory.ts';
import { redinero, scaledFromFloat } from '../utils/dineroUtils.ts';
import makeUUID from '../utils/makeUUID.ts';
import { loaders as sliceLoaders } from './loader.ts';
import { obj as sliceObj } from './obj.ts';
import { table as sliceTable } from './table.ts';

const slice = { obj: sliceObj, table: sliceTable, loaders: sliceLoaders };

export function createSchema<
  O extends FxMap,
  S extends { [key in keyof O]: ReturnType<O[key]>['initialState'] }
>(slices: O): [FxSchema<S, O>, S] {
  const db = {} as FxSchema<S, O>;
  // iterate with `in` so we can preserve key types and use non-null assertions
  for (const k in slices) {
    const key = k as keyof O;
    const factory = slices[key]!;
    // call the factory with the string key and assign into the typed db
    db[key] = factory(String(key)) as unknown as FxSchema<S, O>[typeof key];
  }

  const initialState = {} as S;
  for (const k in db) {
    const key = k as keyof O;
    initialState[key] = db[key]!.initialState as S[typeof key];
  }

  function* update(ups: StoreUpdater<S> | StoreUpdater<S>[]) {
    return yield* updateStore(ups);
  }

  db.update = update;

  return [db, initialState];
}

const addYear = addDays(365);

const DineroSnapshotSchema = z.object({
  amount: z.number(),
  // @dinero/currencies sometimes types `base` as number | readonly number[]
  // Accept both shapes here for validation of persisted snapshots.
  currency: z.object({
    base: z.union([z.number(), z.array(z.number())]),
    code: z.string(),
    exponent: z.number()
  }),
  scale: z.number().default(0)
});
const DineroSchema = z.preprocess((val) => {
  if (typeof val === 'number') {
    const b = redinero(val).toJSON();
    return b;
  }
  return val;
}, DineroSnapshotSchema);

export const ScaledNumberSchema = z.preprocess(
  (val) => {
    if (typeof val === 'number') {
      return scaledFromFloat(val, 4);
    }
    return val;
  },
  z.object({
    amount: z.number(),
    scale: z.number()
  })
);
export type ScaledNumber = z.infer<typeof ScaledNumberSchema>;

export const SettingsSchema = z.object({
  examples: z.boolean().default(true),
  import: z.boolean().default(true),
  accounts: z.boolean().default(true),
  transactions: z.boolean().default(true),
  planning: z.boolean().default(true),
  financialindependence: z.boolean().default(true),
  flow: z.boolean().default(true),
  taxes: z.boolean().default(false)
});
export type Settings = z.infer<typeof SettingsSchema>;

export const defaultSettings = SettingsSchema.parse({});

export const TransactionTypeSchema = z.enum(['income', 'expense', 'transfer']);
export const ValueTypeSchema = z.enum(['static', 'dynamic']).default('static');
export const RepeatTypeSchema = z.enum([
  'none',
  'day',
  'day of week',
  'day of month',
  'bimonthly',
  'quarterly',
  'semiannually',
  'annually'
]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type ValueType = z.infer<typeof ValueTypeSchema>;
export type RepeatType = z.infer<typeof RepeatTypeSchema>;

export const TransactionSchema = z.object({
  id: z.string().default(makeUUID),
  raccount: z.string(), // account id
  vaccount: z.string().optional(), // account id
  transferIn: z.string().nullish(), // account id
  description: z.string().optional(),
  category: z.string(),
  type: TransactionTypeSchema,
  valueType: ValueTypeSchema,
  start: z.iso.date(),
  end: z.iso.date().optional(),
  ending: z
    .enum(['never', 'at date', 'after number of occurrences'])
    .default('never'),
  rtype: RepeatTypeSchema,
  cycle: z.number().default(0),
  value: DineroSchema,
  occurrences: z.number().default(0),
  beginAfterOccurrences: z.number().optional()
});
export type TransactionInput = z.input<typeof TransactionSchema>;
export type Transaction = z.output<typeof TransactionSchema>;

export const AmountVehicleSchema = z.enum([
  'operating',
  'investment',
  'debt',
  'loan',
  'credit line'
]);
export type AmountVehicle = z.infer<typeof AmountVehicleSchema>;

const AccountPaybackSchema = z.object({
  references: z.record(z.string(), DineroSchema).optional(),
  category: z.string(),
  description: z.string().optional(),
  transactions: z.array(TransactionSchema.omit({ category: true, type: true }))
});

export const AccountSchema = z.object({
  id: z.string().default(makeUUID),
  name: z.string(),
  starting: DineroSchema,
  interest: ScaledNumberSchema,
  vehicle: AmountVehicleSchema,
  payback: AccountPaybackSchema.optional()
});
export type AccountInput = z.input<typeof AccountSchema>;
export type Account = z.infer<typeof AccountSchema>;

export const AccountMetaSchema = z.object({
  snapshotDate: z.iso.date()
});
export type AccountMeta = z.infer<typeof AccountMetaSchema>;

export const ChartRangeSchema = z.object({
  start: z.iso.date(),
  end: z.iso.date()
});

export type ChartRange = z.infer<typeof ChartRangeSchema>;

export const defaultChartBarRange = (refDate: Date) =>
  ({
    start: format(refDate, 'yyyy-MM-dd'),
    end: format(addYear(refDate), 'yyyy-MM-dd')
  }) as ChartRange;
const referenceDate = new Date();
const defaultAccountSnapshotData: AccountMeta = {
  snapshotDate: format(referenceDate, 'yyyy-MM-dd')
};

export const IncomeReceivedSchema = z.object({
  id: z.string(),
  date: z.string(),
  group: z.string(),
  gross: z.number(),
  pretaxInvestments: z.number(),
  hsa: z.number(),
  federalTax: z.number(),
  medicare: z.number(),
  socialSecurity: z.number(),
  stateTax: z.number()
});
export type IncomeReceived = z.infer<typeof IncomeReceivedSchema>;
export const IncomeExpectedSchema = z.object({
  quarter: z.number(),
  group: z.string(),
  quantity: z.number()
});
export type IncomeExpected = z.infer<typeof IncomeExpectedSchema>;

const [schema, initialState] = createSchema({
  cache: sliceOG.table({ empty: {} }),
  loaders: slice.loaders(),
  settings: slice.obj<Settings>(defaultSettings),
  // emptyTransaction / emptyAccount come from dinero().toJSON() and may
  // include readonly arrays on currency.base. Cast them to the expected
  // generic types here to avoid a wide readonly vs mutable array type
  // incompatibility during schema construction.
  transactions: slice.table<Transaction>({
    empty: emptyTransaction as unknown as Transaction
  }),
  accounts: slice.table<Account>({ empty: emptyAccount as unknown as Account }),
  accountMeta: slice.obj<AccountMeta>(defaultAccountSnapshotData),
  chartRange: slice.obj(defaultChartBarRange(referenceDate)),
  incomeReceived: slice.table<IncomeReceived>(),
  incomeExpected: slice.table<IncomeExpected>()
});

export { schema, initialState };

export type AppState = typeof initialState;
