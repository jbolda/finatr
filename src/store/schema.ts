import Big from 'big.js';
import addDays from 'date-fns/fp/addDays/index.js';
import { createSchema, slice } from 'starfx/store';

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
  end: string;
  rtype: string;
  cycle: number; // Big
  value: number; // Big
  dailyRate: number; // Big
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

const [schema, initialState] = createSchema({
  cache: slice.table({ empty: {} }),
  loaders: slice.loader(),
  settings: slice.obj<Settings>(defaultSettings),
  transactions: slice.table({ empty: emptyTransaction }),
  accounts: slice.table({ empty: emptyAccount }),
  chartRange: slice.obj(defaultChartBarRange)
});

export { schema, initialState };

export type AppState = typeof initialState;
