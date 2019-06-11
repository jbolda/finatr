import { create } from 'microstates';
import AppModel from './../../state';
import {
  applyModifications,
  buildStack,
  resolveBarChart,
  resolveAccountChart
} from './index.js';
import computeTransactionModifications from './resolveTransactions';
import Big from 'big.js';
import startOfDay from 'date-fns/fp/startOfDay';
import eachDayOfInterval from 'date-fns/fp/eachDayOfInterval';
import format from 'date-fns/fp/format';

import { testData, testData2 } from './index.testdata.js';

const formatDate = format('yyyy-MM-dd kkmmss');

let graphRange = {
  start: startOfDay('2018-03-01'),
  end: startOfDay('2018-09-01')
};
testData.charts = {};
testData.charts.GraphRange = graphRange;

let resolvedTestData = create(AppModel, testData).reCalc();

describe(`check state creation`, () => {
  it(`returns the correct number of transactions`, () => {
    expect(resolvedTestData.state.transactions).toHaveLength(7);
  });
  it(`returns the correct number of accounts`, () => {
    expect(resolvedTestData.state.accounts).toHaveLength(3);
  });
  it(`returns the correct number of BarChartIncome`, () => {
    expect(resolvedTestData.charts.state.BarChartIncome).toHaveLength(6);
  });
  it(`has the correct BarChartIncome structure`, () => {
    expect(resolvedTestData.charts.state.BarChartIncome).toEqual(
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
    expect(resolvedTestData.charts.state.BarChartExpense).toHaveLength(5);
  });
  it(`calcs the correct BarChartMax`, () => {
    expect(resolvedTestData.charts.BarChartMax.toNumber).toBe(510);
  });
  it(`calcs the correct LineChartMax`, () => {
    expect(resolvedTestData.charts.LineChartMax.toNumber).toBe(49680);
  });
  it(`calcs the correct dailyIncome`, () => {
    expect(resolvedTestData.stats.dailyIncome.toNumber).toBe(163);
  });
  it(`calcs the correct dailyExpense`, () => {
    expect(resolvedTestData.stats.dailyExpense.toNumber).toBe(270);
  });
  it(`calcs the correct savingsRate`, () => {
    expect(resolvedTestData.stats.savingsRate.toNumber).toBeCloseTo(44.44);
  });
  it(`calcs the correct fiNumber`, () => {
    expect(resolvedTestData.stats.fiNumber.toNumber).toBeCloseTo(1.218);
  });
  it(`handles invalid interval on single transaction`, () => {
    let testData1 = {
      accounts: testData.accounts,
      transactions: [
        {
          id: `oasis92hoogyboogy`,
          raccount: `account`,
          description: `description`,
          category: `test complex`,
          type: `income`,
          start: `2018-09-22`,
          rtype: `none`,
          value: Big(190),
          dailyRate: Big(0)
        }
      ]
    };
    testData1.charts = {};
    testData1.charts.GraphRange = graphRange;

    let resolvedTestData1 = create(AppModel, testData1).reCalc();
    expect(resolvedTestData1.charts.state.BarChartIncome.length).toBe(1);
  });

  it(`handles invalid interval on single transaction of many`, () => {
    let testData1 = {
      accounts: testData.accounts,
      transactions: [
        ...testData.transactions,
        {
          id: `oasis92hoogyboogy`,
          raccount: `account`,
          description: `description`,
          category: `test complex`,
          type: `income`,
          start: `2018-09-22`,
          rtype: `none`,
          value: Big(190),
          dailyRate: Big(0)
        }
      ]
    };
    testData1.charts = {};
    testData1.charts.GraphRange = graphRange;

    let resolvedTestData1 = create(AppModel, testData1).reCalc();
    expect(resolvedTestData1.charts.state.BarChartIncome.length).toBe(7);
  });
});

describe(`check integrated transaction reoccurence`, () => {
  it(`returns the correct number of daily reoccurences`, () => {
    let singleTransaction = resolvedTestData.transactions
      .set([
        {
          id: `every-other-week`,
          raccount: `account`,
          category: `bi-weekly paycheck`,
          type: `income`,
          start: `2018-02-04`,
          rtype: `day`,
          value: 1200,
          cycle: 14
        }
      ])
      .accounts.set([
        {
          name: 'account',
          starting: 0,
          interest: 0.01,
          vehicle: 'operating'
        }
      ])
      .reCalc();

    // This should occur every two weeks (cycle = 14)
    // beginning on Feb 4th, 2018, but the graphrange doesn't
    // start until March 1st, 2018. This means the first time it
    // shows up should be on March 4th. This will mean we have
    // 13 total occurences of the transaction in our range.
    // (The 14th lands on Sept 2nd.) If we erroneously show the
    // first occurence at the beginning of the graphrange, which
    // is 3 days earlier, we would see 14 occurences instead.

    // the max with a single transaction should === value of that transaction
    expect(singleTransaction.charts.state.BarChartMax).toEqual(1200);
    // the max should be our 13 occurences * value + starting ($0 here)
    // that is: 13 * 1200 = 15600
    expect(singleTransaction.charts.state.LineChartMax).toEqual(15600);
  });

  it(`returns the correct number of day of week reoccurrences`, () => {
    const singleTransaction = resolvedTestData.transactions
      .set([
        {
          id: `every-other-week`,
          raccount: `account`,
          category: `annual expense`,
          type: `expense`,
          start: `2019-05-04`,
          rtype: `day of week`,
          value: 50,
          cycle: 1
        }
      ])
      .accounts.set([
        {
          name: 'account',
          starting: 3000,
          interest: 0.01,
          vehicle: 'operating'
        }
      ])
      .charts.updateStartDate('2019-03-01')
      .reCalc();

    // This should every week starting on May 6th which
    // comes out to 44 occurrences throughout the year

    // the max with a single transaction should === value of that transaction
    expect(singleTransaction.charts.state.BarChartMax).toEqual(50);
    expect(singleTransaction.charts.state.LineChartMax).toEqual(3000);

    const values = singleTransaction.charts.state.AccountChart[0].values;
    expect(values[132]).toEqual({
      date: startOfDay('2019-05-06'),
      value: 2950
    });
    expect(values[188]).toEqual({
      date: startOfDay('2019-06-03'),
      value: 2750
    });

    const count = singleTransaction.charts.state.AccountChart[0].values.length;
    // if 52 occurrences in a year, and we missed 8 at the beginning of the range
    // the max should be our starting - 44 occurences * value = 800
    expect(
      singleTransaction.charts.state.AccountChart[0].values[count - 1].value
    ).toEqual(800);
  });

  it(`returns the correct number of semiannual reoccurences`, () => {
    let singleTransaction = resolvedTestData.transactions
      .set([
        {
          id: `every-other-week`,
          raccount: `account`,
          category: `bi-yearly paycheck`,
          type: `expense`,
          start: `2019-02-04`,
          rtype: `semiannually`,
          value: 1200,
          cycle: null
        }
      ])
      .accounts.set([
        {
          name: 'account',
          starting: 2400,
          interest: 0.01,
          vehicle: 'operating'
        }
      ])
      .updateStartDateReCalc('2019-03-01');

    // This should occur twice a year beginning on Feb 4th, 2019,
    // but the graphrange doesn't start until March 1st, 2019.
    // This means the first time it shows up should be on July 4th.
    // This will mean we have 2 total occurences of the transaction in
    // our range every time if we look at a 365 day year.

    // the max with a single transaction should === value of that transaction
    expect(singleTransaction.charts.state.BarChartMax).toEqual(1200);
    expect(singleTransaction.charts.state.LineChartMax).toEqual(2400);

    expect(singleTransaction.charts.state.AccountChart[0].values[312]).toEqual({
      date: startOfDay('2019-08-04'),
      value: 1200
    });

    const count = singleTransaction.charts.state.AccountChart[0].values.length;
    // the max should be our starting - 2 occurences * value = 0
    expect(
      singleTransaction.charts.state.AccountChart[0].values[count - 1].value
    ).toEqual(0);
  });

  it(`returns the correct number of annual reoccurrences`, () => {
    const singleTransaction = resolvedTestData.transactions
      .set([
        {
          id: `every-other-week`,
          raccount: `account`,
          category: `annual expense`,
          type: `expense`,
          start: `2019-05-04`,
          rtype: `annually`,
          value: 5000,
          cycle: null
        }
      ])
      .accounts.set([
        {
          name: 'account',
          starting: 12000,
          interest: 0.01,
          vehicle: 'operating'
        }
      ])
      .charts.updateStartDate('2019-03-01', '2021-04-01')
      .reCalc();

    // This should occur once a year beginning on May 4th, 2019,
    // but the graphrange doesn't start until March 1st, 2019.
    // This means the first time it shows up should be on July 4th.
    // This will mean we have 2 total occurrences of the transaction in
    // our range as our range is set to longer then a year. If it erroneously,
    // starts at the beginning of the graphrange, then we would see 3 occurrences.

    // the max with a single transaction should === value of that transaction
    expect(singleTransaction.charts.state.BarChartMax).toEqual(5000);
    expect(singleTransaction.charts.state.LineChartMax).toEqual(12000);

    expect(singleTransaction.charts.state.AccountChart[0].values[128]).toEqual({
      date: startOfDay('2019-05-04'),
      value: 7000
    });
    expect(singleTransaction.charts.state.AccountChart[0].values[860]).toEqual({
      date: startOfDay('2020-05-04'),
      value: 2000
    });

    const count = singleTransaction.charts.state.AccountChart[0].values.length;
    // the max should be our starting - 2 occurences * value = 2000
    expect(
      singleTransaction.charts.state.AccountChart[0].values[count - 1].value
    ).toEqual(2000);
  });
});

describe(`check resolveData handles paybacks`, () => {
  it(`has the correct BarChartExpense structure`, () => {
    expect(resolvedTestData.charts.state.BarChartExpense).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'payback2-test-1EXP'
        })
      ])
    );

    expect(resolvedTestData.charts.state.BarChartExpense).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'payback2-test-1TRSF'
        })
      ])
    );
  });

  it(`ends with the correct balance`, () => {
    let revisedTestData = testData;
    revisedTestData.transactions = [];
    let resolvedTestData = create(AppModel, revisedTestData).reCalc();

    // that is 163 days between start and end
    // 164*$140 + 164/3*$60 + (1) extra $60 = 22960 + 3240 + 60 = 26260
    const count =
      resolvedTestData.charts.state.AccountChart[0].values.length - 1;
    // this tests the transfer, which reduces the balance of the payment account
    // $3000 starting - 26260 = -23260
    expect(
      resolvedTestData.charts.state.AccountChart[0].values[count].value
    ).toEqual(-23260);

    // this tests the expense, which increases the balance of the debt account
    // $30000 starting - 26260 = 3740
    expect(
      resolvedTestData.charts.state.AccountChart[1].values[count].value
    ).toEqual(3740);
  });
});

describe(`check resolveData handles credit lines`, () => {
  let singleTestData = {
    transactions: [
      {
        id: `expense-on-credit-ilne`,
        raccount: `account2`,
        description: `description`,
        category: `test exp`,
        type: `expense`,
        start: `2018-03-22`,
        rtype: `day`,
        cycle: 14,
        value: 1000
      }
    ],
    accounts: [
      {
        name: 'account1',
        starting: 15000,
        interest: 0.01,
        vehicle: 'operating'
      },
      {
        name: 'account2',
        starting: 30000,
        interest: 18.0,
        vehicle: 'credit line',
        payback: {
          description: `payback`,
          category: 'account2 payback',
          transactions: [
            {
              id: `payback1-test`,
              raccount: 'account1',
              start: `2018-03-22`,
              rtype: `day`,
              cycle: 1,
              value: 40
            },
            {
              id: `payback2-test`,
              raccount: 'account1',
              start: `2018-03-22`,
              rtype: `day`,
              cycle: 3,
              value: 180
            }
          ]
        }
      }
    ],
    charts: { GraphRange: graphRange }
  };
  let resolvedTestData = create(AppModel, singleTestData).reCalc();

  it(`ends with the correct balance`, () => {
    // that is 163 days between start and end (plus 1 for the end day)
    // payback is ~$100 a day, where the expense is $1000 every 14
    // on the balance of $30000, we should be paying down ~$400 every 14 days
    // daily payback: 40 * 164 = 6560
    // every 3 day payback: 163 / 3 = 54.3 => 55 * 180 = 9900
    // 14 day expense: 163 / 14 = 11.6 => 12 * 1000 = 12000
    // 30000 + 12000 - 6560 - 9900 = 25540
    const count =
      resolvedTestData.charts.state.AccountChart[1].values.length - 1;
    expect(
      resolvedTestData.charts.state.AccountChart[1].values[count].value
    ).toEqual(25540);
  });
});

describe('checks modifications', () => {
  let allDates = eachDayOfInterval(graphRange);
  let stackStructure = allDates.map(day => {
    let obj = { date: day };
    testData2.forEach(datum => {
      obj[datum.id] = { ...datum };
      obj[datum.id].y = Big(0);
    });
    return obj;
  });

  // return array of modifications to be applied to stackStructure
  let testMods = computeTransactionModifications(testData2, graphRange);
  let modOneApplied = applyModifications(allDates)(stackStructure, testMods[0]);
  let stackComputed = buildStack(testData2, graphRange);

  it('provides correct modification array', () => {
    expect(formatDate(testMods[0].date)).toBe('2018-03-22 240000');
    expect(testMods[0].mutateKey).toBe('test-data-2');
    expect(testMods[0].y.toFixed(0)).toBe('150');
  });

  it('correctly applies a modification', () => {
    expect(formatDate(modOneApplied[21].date)).toBe('2018-03-22 240000');
    expect(modOneApplied[21]['test-data-2'].id).toBe('test-data-2');
    expect(modOneApplied[21]['test-data-2'].value.toFixed(0)).toBe('150');
    expect(modOneApplied[21]['test-data-2'].y.toFixed(0)).toBe('150');
  });

  it('provides correctly modified date array', () => {
    expect(stackComputed).toHaveLength(185);

    expect(formatDate(stackComputed[24].date)).toBe('2018-03-25 240000');
    expect(stackComputed[24]['test-data-2'].id).toBe('test-data-2');
    expect(stackComputed[24]['test-data-2'].value.toFixed(0)).toBe('150');
    expect(stackComputed[24]['test-data-2'].y.toFixed(0)).toBe('150');
  });
});

describe('check AccountChart', () => {
  it('outputs an empty array if values is empty', () => {
    let accounts = [{ name: 'test1' }, { name: 'test2' }];
    let incomeRaw = [
      { raccount: 'test1', start: graphRange.start, value: Big(10) }
    ];
    let income = resolveBarChart(incomeRaw, { graphRange });
    let expense = [];
    let resolvedTestData = resolveAccountChart({ accounts, income, expense });
    expect(resolvedTestData).toHaveLength(1);
  });
});
