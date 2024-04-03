import { type as BigType } from 'big.js';
import addDays from 'date-fns/fp/addDays/index.js';
import { createSchema, slice } from 'starfx';

import { emptyTransaction, emptyAccount } from './factory.ts';

const addYear = addDays(365);

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

type TransactionType = 'income' | 'expense' | 'transfet';
interface Transaction {
  id: string;
  raccount: string;
  description: string;
  category: string;
  type: TransactionType;
  start: string;
  ending: string;
  rtype: string;
  cycle: number; // Big
  value: number; // Big
  dailyRate: BigType; // Big
  occurrences: number; // Big
  beginAfterOccurrences: number;
}

interface Account {
  name: string;
  starting: number; // Big
  interest: number; // Big
  vehicle: string;
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
