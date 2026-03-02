import { format } from 'date-fns';
import addDays from 'date-fns/fp/addDays/index.js';
import { LoroMap } from 'loro-crdt';
import {
  slice as sliceOG,
  createSchema,
  createSchemaWithUpdater,
  expectStore,
  type UpdaterCtx,
  type Next,
  type SliceFromSchema,
  type FxMap,
  type FxSchema,
  type BaseMiddleware,
  StoreContext,
  persistStoreMdw
} from 'starfx';
import { createLocalStorageAdapter, createPersistor } from 'starfx';
import { z } from 'zod';

import { emptyAccount, emptyTransaction } from '../factory.ts';
import { createDocPersistor, persistDocMdw } from '../persist.ts';
import { buildDocSubtree } from '../updater.ts';
import { redinero, scaledFromFloat } from '../utils/dineroUtils.ts';
import makeUUID from '../utils/makeUUID.ts';
import { RootDoc } from './context.ts';
import { obj as sliceObj } from './obj.ts';
import { table as sliceTable } from './table.ts';

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
  taxes: z.boolean().default(false),
  // user preference for persisting application state locally.
  // defaults to false so tests start with a clean in-memory store.
  persist: z.boolean().default(false)
});
export type Settings = z.infer<typeof SettingsSchema>;

const defaultSettings = SettingsSchema.parse({});

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

// a separate persistor for meta state; always enabled so the
// settings slices are durable independent of the main
// document persistence toggle. we only need to save the meta portion of
// the store, not the entire application state.

export const metaPersistor = createPersistor<{
  settings: Settings;
  auth: { user: null | string };
  cache: unknown;
}>({
  adapter: createLocalStorageAdapter(),
  key: 'finatr-meta',
  allowlist: ['settings', 'cache']
});

export const metaSchema = createSchema(
  {
    cache: sliceOG.table(),
    loaders: sliceOG.loaders(),
    auth: sliceOG.obj({ user: null }),
    settings: sliceOG.obj<Settings>(defaultSettings)
  },
  {
    middleware: [persistStoreMdw(metaPersistor)]
  }
);

export const localPersistor = createDocPersistor({
  key: 'finatr',
  adapter: createLocalStorageAdapter()
});

function createLoroSchema<O extends FxMap>(
  slices: O,
  options: {
    /**
     * Unique name for this schema. Used to access the schema from the store.
     * @default "default"
     */
    name?: string;
    middleware?: BaseMiddleware<UpdaterCtx<SliceFromSchema<O>>>[];
  } = {}
): FxSchema<O> {
  return createSchemaWithUpdater(slices, {
    name: options.name,
    middleware: options.middleware,
    *initialize() {
      const store = yield* StoreContext.expect();
      const scope = store.getScope();
      const ldoc = yield* RootDoc.expect();
      const root = ldoc.getMap('root');

      const initial = store.getInitialState();
      root.set('settings', Object.entries(initial['settings']));

      // set up a map for all sources
      const sources = root.setContainer('sources', new LoroMap());
      // then a default subdoc for local data
      const local = sources.setContainer('local', new LoroMap());
      const plan = local.setContainer('plan', new LoroMap());
      buildDocSubtree({ initial, parent: plan });
      ldoc.commit();
      scope.set(RootDoc, ldoc);
    },
    *updateMdw(ctx: UpdaterCtx<SliceFromSchema<O>>, next: Next) {
      const root = yield* RootDoc.expect();
      const store = yield* expectStore();
      const plan = root
        .getMap('root')
        .getOrCreateContainer('sources', new LoroMap())!
        .getOrCreateContainer('local', new LoroMap())!
        .getOrCreateContainer('plan', new LoroMap())!;
      const ups = Array.isArray(ctx.updater) ? ctx.updater : [ctx.updater];
      console.dir({ ups, plan });
      for (let up of ups as unknown as Array<
        (state: LoroMap<Record<string, unknown>>) => void
      >) {
        up(plan);
      }
      root.commit();
      const nextPlanState = plan.toJSON() as SliceFromSchema<O>;
      store.setState(nextPlanState);
      yield* next();
    }
  });
}

export const loroSchema = createLoroSchema(
  {
    // emptyTransaction / emptyAccount come from dinero().toJSON() and may
    // include readonly arrays on currency.base. Cast them to the expected
    // generic types here to avoid a wide readonly vs mutable array type
    // incompatibility during schema construction.
    transactions: sliceTable<Transaction>({
      empty: emptyTransaction as Transaction
    }),
    accounts: sliceTable<Account>({
      empty: emptyAccount as Account
    }),
    accountMeta: sliceObj<AccountMeta>(defaultAccountSnapshotData),
    chartRange: sliceObj(defaultChartBarRange(referenceDate)),
    incomeReceived: sliceTable<IncomeReceived>(),
    incomeExpected: sliceTable<IncomeExpected>()
  },
  {
    name: 'loro',
    middleware: [
      persistDocMdw(localPersistor) as unknown as BaseMiddleware<
        UpdaterCtx<SliceFromSchema<any>>
      >
    ]
  }
);

export const schemas = [metaSchema, loroSchema];
