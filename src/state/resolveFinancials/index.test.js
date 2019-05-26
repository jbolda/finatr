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
