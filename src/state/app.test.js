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
  it(`computes from a single reference on transaction`, () => {
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
    }).reCalc();

    for (let transaction of computatedTest.transactionsComputed) {
      expect(transaction.value.toFixed).toEqual('50.00');
    }
  });

  it(`computes from a nested reference on transaction`, () => {
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
          references: { statementBalance: 75, currentBalance: 200 },
          computedAmount: {
            reference: 'currentBalance',
            operation: 'minus',
            on: { reference: 'statementBalance' }
          }
        }
      ]
    }).reCalc();

    for (let transaction of computatedTest.transactionsComputed) {
      expect(transaction.value.toFixed).toEqual('125.00');
    }
  });

  it(`computes from a deeply nested reference on transaction`, () => {
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
          references: {
            statementBalance: 50,
            currentBalance: 800,
            otherValueOne: 350,
            otherValueTwo: 1000
          },
          computedAmount: {
            reference: 'otherValueTwo',
            operation: 'minus',
            on: {
              reference: 'statementBalance',
              operation: 'add',
              on: {
                reference: 'currentBalance',
                operation: 'minus',
                on: { reference: 'otherValueOne' }
              }
            }
          }
        }
      ]
    }).reCalc();

    for (let transaction of computatedTest.transactionsComputed) {
      expect(transaction.value.toFixed).toEqual('500.00');
    }
  });

  it(`computes from a single reference on accounts`, () => {
    let computatedTest = create(AppModel, {
      accounts: [
        {
          payback: {
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
                references: { statementBalance: 55, currentBalance: 200 },
                computedAmount: {
                  reference: 'statementBalance'
                }
              }
            ]
          }
        }
      ]
    }).reCalc();

    for (let transaction of computatedTest.transactionsComputed) {
      // ignore the default transaction
      if (transaction.id.state !== 'seed-data-id') {
        expect(transaction.value.toFixed).toEqual('55.00');
      }
    }
  });

  it(`computes from a nested reference on accounts`, () => {
    let computatedTest = create(AppModel, {
      accounts: [
        {
          payback: {
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
                references: { statementBalance: 40, currentBalance: 200 },
                computedAmount: {
                  reference: 'currentBalance',
                  operation: 'minus',
                  on: { reference: 'statementBalance' }
                }
              }
            ]
          }
        }
      ]
    }).reCalc();

    for (let transaction of computatedTest.transactionsComputed) {
      // ignore the default transaction
      if (transaction.id.state !== 'seed-data-id') {
        expect(transaction.value.toFixed).toEqual('160.00');
      }
    }
  });

  it(`computes from a deeply nested reference on accounts`, () => {
    let computatedTest = create(AppModel, {
      accounts: [
        {
          payback: {
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
                references: {
                  statementBalance: 50,
                  currentBalance: 800,
                  otherValueOne: 350,
                  otherValueTwo: 850
                },
                computedAmount: {
                  reference: 'otherValueTwo',
                  operation: 'minus',
                  on: {
                    reference: 'statementBalance',
                    operation: 'add',
                    on: {
                      reference: 'currentBalance',
                      operation: 'minus',
                      on: { reference: 'otherValueOne' }
                    }
                  }
                }
              }
            ]
          }
        }
      ]
    }).reCalc();
    for (let transaction of computatedTest.transactionsComputed) {
      // ignore the default transaction
      if (transaction.id.state !== 'seed-data-id') {
        expect(transaction.value.toFixed).toEqual('350.00');
      }
    }
  });
});
