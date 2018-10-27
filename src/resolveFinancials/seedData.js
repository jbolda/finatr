import { past, future } from './index';

let seedOne = {
  transactions: [],
  accounts: [
    {
      name: 'account',
      starting: 0,
      interest: 0,
      vehicle: 'operating'
    }
  ],
  charts: {
    GraphRange: { start: past(), end: future(365) },
    BarChartIncome: [],
    BarChartExpense: []
  },
  stats: {
    dailyIncome: 0,
    dailyExpenses: 0,
    dailyRate: 0,
    savingsRate: 0,
    fiNumber: 0
  },
  forms: {
    transactionForm: {
      id: ``,
      raccount: `the account`,
      description: `description`,
      category: `test default`,
      type: `income`,
      start: `2018-03-22`,
      rtype: `day`,
      cycle: 3,
      value: 150
    },
    accountForm: {
      name: 'the account',
      starting: 1000,
      interest: 0.0,
      vehicle: 'operating'
    },
    accountTransactionForm: {
      id: ``,
      debtAccount: `the account`,
      raccount: `the account`,
      start: `2018-03-22`,
      rtype: `day`,
      cycle: 3,
      generatedOccurences: 0,
      value: 150
    }
  }
};

export { seedOne, seedOne as default };

let seedTwo = {
  ...seedOne,
  transactions: [
    {
      id: `oasidjas1`,
      raccount: `account`,
      description: `description`,
      category: `test default`,
      type: `income`,
      start: `2018-03-22`,
      rtype: `day`,
      cycle: 3,
      value: 150
    },
    {
      id: `oasis2`,
      raccount: `account`,
      description: `description`,
      category: `test default occurences`,
      type: `income`,
      start: `2018-09-22`,
      occurences: 7,
      rtype: `day`,
      cycle: 1,
      value: 100
    },
    {
      id: `initial-data-3`,
      raccount: `account`,
      description: `description`,
      category: `test complex`,
      type: `income`,
      start: `2018-03-22`,
      rtype: `day of week`,
      cycle: 2,
      value: 35
    },
    {
      id: `oasis6`,
      raccount: `account`,
      description: `description`,
      category: `test complex`,
      type: `income`,
      start: `2018-03-22`,
      rtype: `day of month`,
      cycle: 1,
      value: 90
    },
    {
      id: `oasis92`,
      raccount: `account`,
      description: `description`,
      category: `test complex`,
      type: `income`,
      start: `2018-09-22`,
      rtype: `none`,
      value: 190
    },
    {
      id: `oasis8`,
      raccount: `account`,
      description: `description`,
      category: `test comp`,
      type: `expense`,
      start: `2018-03-22`,
      rtype: `day of month`,
      cycle: 1,
      value: 112
    },
    {
      id: `oasis8asg`,
      raccount: `account2`,
      description: `description`,
      category: `test comp`,
      type: `transfer`,
      start: `2018-03-22`,
      rtype: `day`,
      cycle: 1,
      value: 112
    }
  ],
  accounts: [
    {
      name: 'account',
      starting: 3000,
      interest: 0.01,
      vehicle: 'operating'
    },
    {
      name: 'account2',
      starting: 30000,
      interest: 0.01,
      vehicle: 'investment'
    },
    {
      name: 'account3',
      starting: 30000,
      interest: 6.0,
      vehicle: 'debt',
      payback: {
        id: `sasdqljg`,
        description: `payback`,
        category: 'account3 payback',
        type: 'expense',
        payoffBalance: 1500,
        transactions: [
          {
            raccount: 'account',
            start: `2018-03-15`,
            rtype: `day of month`,
            cycle: 15,
            value: 112
          },
          {
            raccount: 'account',
            start: `2018-03-15`,
            rtype: `day of month`,
            cycle: 15,
            visibleOccurrences: 1,
            value: 'payoffBalance'
          }
        ]
      }
    }
  ]
};

export { seedTwo };
