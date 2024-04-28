import addDays from 'date-fns/fp/addDays/index.js';
import { type Dinero } from 'dinero.js';
import { createSchema, slice } from 'starfx';

import { emptyAccount, emptyTransaction } from './factory.ts';

const addYear = addDays(365);

export type ScaledNumber = {
  amount: number;
  scale: number;
};

interface Settings {
  examples: boolean;
  import: boolean;
  accounts: boolean;
  transactions: boolean;
  planning: boolean;
  financialindependence: boolean;
  flow: boolean;
  taxes: boolean;
}

const defaultSettings = {
  examples: false,
  import: false,
  accounts: false,
  transactions: false,
  planning: true,
  financialindependence: false,
  flow: false,
  taxes: false
};

type TransactionType = 'income' | 'expense' | 'transfer';
interface Transaction {
  id: string;
  raccount: string;
  description: string;
  category: string;
  type: TransactionType;
  start: string;
  ending: string;
  rtype: string;
  cycle: number;
  value: Dinero<number>;
  dailyRate: Dinero<number>;
  occurrences: number;
  beginAfterOccurrences: number;
}

type AmountVehicle =
  | 'operating'
  | 'investment'
  | 'debt'
  | 'loan'
  | 'credit line';
interface Account {
  name: string;
  starting: Dinero<number>;
  interest: ScaledNumber;
  vehicle: AmountVehicle;
  payback: Transaction[];
}

interface ChartRange {
  start: Date;
  end: Date;
}

const referenceDate = new Date();
const defaultChartBarRange: ChartRange = {
  start: referenceDate,
  end: addYear(referenceDate)
};

interface IncomeReceived {
  id: string;
  date: string;
  group: string;
  gross: number;
  pretaxInvestments: number;
  hsa: number;
  federalTax: number;
  medicare: number;
  socialSecurity: number;
  stateTax: number;
}

interface IncomeExpected {
  quarter: number;
  group: string;
  quantity: number;
}

const [schema, initialState] = createSchema({
  cache: slice.table({ empty: {} }),
  loaders: slice.loaders(),
  settings: slice.obj<Settings>(defaultSettings),
  transactions: slice.table({ empty: emptyTransaction }),
  accounts: slice.table({ empty: emptyAccount }),
  chartRange: slice.obj(defaultChartBarRange),
  incomeReceived: slice.table<IncomeReceived>(),
  incomeExpected: slice.table<IncomeExpected>()
});

export { schema, initialState };

export type AppState = typeof initialState;
