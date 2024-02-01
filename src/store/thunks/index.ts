import { thunks as settingsThunk } from './settings.ts';
import { thunks as transactionsThunk } from './transactions.ts';
import { thunks as accountsThunk } from './accounts.ts';
import { tasks as chartTasks } from './chartData.ts';

export const thunks = [
  settingsThunk.bootup,
  transactionsThunk.bootup,
  accountsThunk.bootup
];

export const tasks = [...chartTasks];
