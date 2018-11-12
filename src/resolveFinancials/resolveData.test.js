import { create } from 'microstates';
import AppModel from '/src/stateManager.js';
import {
  sortTransactionOrder,
  transactionSplitter,
  applyModifications,
  replaceWithModified,
  buildStack
} from '/src/resolveFinancials';
import computeTransactionModifications from './resolveTransactions.js';
import Big from 'big.js';
import startOfDay from 'date-fns/fp/startOfDay';
import eachDayOfInterval from 'date-fns/fp/eachDayOfInterval';

import { testData, testData2 } from './resolveData.testdata.js';

let graphRange = {
  start: startOfDay('2018-03-01'),
  end: startOfDay('2018-09-01')
};
testData.charts = {};
testData.charts.GraphRange = graphRange;
let splitTransactions = transactionSplitter({
  transactions: testData.transactions,
  accounts: testData.accounts
});

let resolvedTestData = create(AppModel, testData)
  .transactionsSplit.set(splitTransactions)
  .reCalc();

export { resolvedTestData };

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
    expect(resolvedTestData.charts.BarChartMax.toNumber).toBe(460);
  });
  it(`calcs the correct LineChartMax`, () => {
    expect(resolvedTestData.charts.LineChartMax.toNumber).toBe(50110);
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
  // it(`handles invalid interval`, () => {
  //   let resolvedTestData1 = transactionSplitter({
  //     accounts: testData.accounts,
  //     transactions: [
  //       {
  //         id: `oasis92hoogyboogy`,
  //         raccount: `account`,
  //         description: `description`,
  //         category: `test complex`,
  //         type: `income`,
  //         start: `2018-09-22`,
  //         rtype: `none`,
  //         value: 190
  //       }
  //     ]
  //   });
  //   expect(resolvedTestData1.charts.BarChartIncome.length).toBe(0);
  // });
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
      obj[datum.id].dailyRate = Big(0);
    });
    return obj;
  });

  // return array of modifications to be applied to stackStructure
  let testMods = computeTransactionModifications(testData2, graphRange);
  let modOneApplied = applyModifications(allDates)(stackStructure, testMods[0]);
  let stackComputed = buildStack(testData2, graphRange);

  it('provides correct modification array', () => {
    expect(testMods).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          mutateKey: 'test-data-2',
          y: '150',
          dailyRate: '50'
        })
      ])
    );
  });

  it('correctly applies a modification', () => {
    expect(modOneApplied[21]).toEqual(
      expect.objectContaining({
        'test-data-2': {
          id: 'test-data-2',
          value: '150',
          y: '150',
          dailyRate: '50'
        }
      })
    );
  });

  it('provides correctly modified date array', () => {
    expect(stackComputed).toHaveLength(185);

    expect(stackComputed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          'test-data-2': {
            id: 'test-data-2',
            value: '150',
            y: '150',
            dailyRate: '50'
          }
        })
      ])
    );
  });
});
