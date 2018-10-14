import { resolveDataAtDateRange } from './index.js';
import Big from 'big.js';
import startOfDay from 'date-fns/fp/startOfDay';

let data = [];
let dOne = {
  id: `oasidjas1`,
  raccount: `account`,
  description: `description`,
  category: `test default`,
  type: `income`,
  start: `2018-03-22`,
  rtype: `day`,
  cycle: 3,
  value: 150
};
data.push(dOne);
let dTwo = {
  id: `oasis2`,
  raccount: `account`,
  description: `description`,
  category: `test default`,
  type: `income`,
  start: `2018-03-22`,
  rtype: `day`,
  cycle: 1,
  value: 100
};
data.push(dTwo);
let dThree = {
  id: `oasis3`,
  raccount: `account`,
  description: `description`,
  category: `test complex`,
  type: `income`,
  start: `2018-03-22`,
  rtype: `day of week`,
  cycle: 2,
  value: 35
};
data.push(dThree);
let dFour = {
  id: `oasis6`,
  raccount: `account`,
  description: `description`,
  category: `test complex`,
  type: `income`,
  start: `2018-03-22`,
  rtype: `day of month`,
  cycle: 1,
  value: 90
};
data.push(dFour);
let dThreePointFive = {
  id: `oasis92hoogyboogy`,
  raccount: `account`,
  description: `description`,
  category: `test complex`,
  type: `income`,
  start: `2018-09-22`,
  rtype: `none`,
  value: 190
};
data.push(dThreePointFive);
let dFive = {
  id: `oasis8`,
  raccount: `account`,
  description: `description`,
  category: `test comp`,
  type: `expense`,
  start: `2018-03-22`,
  rtype: `day`,
  repeat: 1,
  cycle: 1,
  value: 112
};
data.push(dFive);
let dSix = {
  id: `oasis8asg`,
  raccount: `account2`,
  description: `description`,
  category: `test comp`,
  type: `transfer`,
  start: `2018-03-22`,
  rtype: `day`,
  repeat: 1,
  cycle: 1,
  value: 112
};
data.push(dSix);

let testData = {
  transactions: data,
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
        transactions: [
          {
            raccount: 'account',
            start: `2018-03-22`,
            rtype: `day`,
            cycle: 1,
            value: 112
          },
          {
            raccount: 'account',
            type: 'expense',
            start: `2018-03-22`,
            rtype: `day`,
            cycle: 3,
            value: 78
          }
        ]
      }
    }
  ],
  transactionForm: {
    id: `oasid7`,
    raccount: `account`,
    description: `description`,
    category: `test default`,
    type: `income`,
    start: `2018-03-22`,
    rtype: `day`,
    cycle: 3,
    value: 150
  },
  accountForm: {
    name: 'new account',
    starting: 1000,
    interest: 0.0,
    vehicle: 'operating'
  }
};

let graphRange = {
  start: startOfDay('2018-03-01'),
  end: startOfDay('2018-09-01')
};
let resolvedTestData = resolveDataAtDateRange(testData, graphRange);
resolvedTestData.BarChartIncome.forEach(obj => (obj.stack = null));
resolvedTestData.BarChartExpense.forEach(obj => (obj.stack = null));

describe(`check resolveData`, () => {
  it(`returns the correct number of transactions`, () => {
    expect(resolvedTestData.transactions).toHaveLength(7);
  });
  it(`returns the correct number of accounts`, () => {
    expect(resolvedTestData.accounts).toHaveLength(3);
  });
  it(`returns the correct number of BarChartIncome`, () => {
    expect(resolvedTestData.BarChartIncome).toHaveLength(6);
  });
  it(`has the correct BarChartIncome structure`, () => {
    expect(resolvedTestData.BarChartIncome).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'test default',
          cycle: Big(3),
          dailyRate: expect.any(Big),
          description: 'description',
          id: 'oasidjas1',
          maxHeight: expect.any(Big),
          raccount: 'account',
          rtype: 'day'
        })
      ])
    );
  });
  it(`returns the correct number of BarChartExpense`, () => {
    expect(resolvedTestData.BarChartExpense).toHaveLength(5);
  });
  it(`calcs the correct BarChartMax`, () => {
    expect(Number(resolvedTestData.BarChartMax)).toBe(448);
  });
  it(`calcs the correct LineChartMax`, () => {
    expect(Number(resolvedTestData.LineChartMax)).toBe(48368);
  });
  it(`calcs the correct dailyIncome`, () => {
    expect(resolvedTestData.dailyIncome).toBe(258);
  });
  it(`calcs the correct dailyExpense`, () => {
    expect(resolvedTestData.dailyExpense).toBe(672);
  });
  it(`calcs the correct savingsRate`, () => {
    expect(Number(resolvedTestData.savingsRate.toFixed(2))).toBe(33.33);
  });
  it(`calcs the correct fiNumber`, () => {
    expect(Number(resolvedTestData.fiNumber.toFixed(3))).toBe(0.489);
  });
  it(`handles invalid interval`, () => {
    let resolvedTestData1 = resolveDataAtDateRange(
      { transactions: [dThreePointFive] },
      graphRange
    );
    expect(resolvedTestData.BarChartIncome.length).toBe(0);
  });
});

describe(`check resolveData handles paybacks`, () => {
  it(`has the correct BarChartExpense structure`, () => {
    expect(resolvedTestData.BarChartExpense).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'sasdqljg-0EXP'
        })
      ])
    );

    expect(resolvedTestData.BarChartExpense).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'sasdqljg-0TRSF'
        })
      ])
    );
  });
});
