import { create } from 'microstates';
import AppModel from './../state';
import startOfDay from 'date-fns/fp/startOfDay';

import { testData } from './resolveFinancials/index.testdata.js';

let graphRange = {
  start: startOfDay('2018-03-01'),
  end: startOfDay('2018-09-01')
};
testData.charts = {};
testData.charts.GraphRange = graphRange;

let resolvedTestData = create(AppModel, testData).reCalc();

describe(`transaction array changes`, () => {
  it(`has the correct length when an item is deleted`, () => {
    expect(resolvedTestData.transactionsComputed).toHaveLength(11);
    const modTestData = resolvedTestData.deleteTransaction(`oasidjas1`);
    expect(modTestData.transactionsComputed).toHaveLength(10);
  });
});

describe(`computed transaction amounts return correctly`, () => {
  it(`computes from a single reference`, () => {
    let computatedTest = create(AppModel, {
      transactions: [
        {
          id: `computated-test`,
          raccount: `account`,
          description: `description`,
          category: `test default`,
          type: `income`,
          start: `2018-03-22`,
          rtype: `day`,
          cycle: 3,
          value: 150,
          references: { statementBalance: 50, currentBalance: 200 },
          computedAmount: {
            reference: 'statementBalance'
          }
        }
      ]
    });

    for (let transaction of computatedTest.transactions) {
      expect(transaction.amount.state).toEqual(50);
    }
  });

  it(`computes from a nested reference`, () => {
    let computatedTest = create(AppModel, {
      transactions: [
        {
          id: `computated-test`,
          raccount: `account`,
          description: `description`,
          category: `test default`,
          type: `income`,
          start: `2018-03-22`,
          rtype: `day`,
          cycle: 3,
          value: 150,
          statementBalance: 50,
          currentBalance: 200,
          computedAmount: {
            reference: 'value',
            operation: 'minus',
            on: { reference: 'statementBalance' }
          }
        }
      ]
    });

    for (let transaction of computatedTest.transactions) {
      expect(transaction.amount.state).toEqual(100);
    }
  });
});
