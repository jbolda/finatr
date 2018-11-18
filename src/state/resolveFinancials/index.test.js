import { create } from 'microstates';
import AppModel from '/src/state';
import { applyModifications, buildStack } from './index.js';
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
    expect(resolvedTestData.charts.BarChartMax.toNumber).toBe(250);
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

describe(`check resolveData handles paybacks`, () => {
  it(`has the correct BarChartExpense structure`, () => {
    expect(resolvedTestData.charts.state.BarChartExpense).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'payback-test-0EXP'
        })
      ])
    );

    expect(resolvedTestData.charts.state.BarChartExpense).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'payback-test-0TRSF'
        })
      ])
    );
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
