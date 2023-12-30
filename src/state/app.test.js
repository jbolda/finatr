import { test, expect } from '@playwright/experimental-ct-react17';
import { create } from 'microstates';
import AppModel from './../state';
import parseISO from 'date-fns/fp/parseISO/index.js';
import startOfDay from 'date-fns/fp/startOfDay/index.js';

import { testData } from './resolveFinancials/index.testdata.js';

let graphRange = {
  start: startOfDay(parseISO('2018-03-01')),
  end: startOfDay(parseISO('2018-09-01'))
};
testData.charts = {};
testData.charts.GraphRange = graphRange;

test.describe(`transaction array changes`, () => {
  test(`has the correct length when an item is deleted`, () => {
    let resolvedTestData = create(AppModel, testData).reCalc();
    expect(resolvedTestData.transactionsComputed).toHaveLength(11);
    const modTestData = resolvedTestData.deleteTransaction(`oasidjas1`);
    expect(modTestData.transactionsComputed).toHaveLength(10);
  });
});

test.describe(`computed transaction amounts return correctly`, () => {
  test(`computes from a single reference on transaction`, () => {
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

    expect.hasAssertions();
    for (let transaction of computatedTest.transactionsComputed) {
      expect(transaction.value.toFixed).toEqual('50.00');
    }
  });

  test(`computes from a nested reference on transaction`, () => {
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

    expect.hasAssertions();
    for (let transaction of computatedTest.transactionsComputed) {
      expect(transaction.value.toFixed).toEqual('125.00');
    }
  });

  test(`computes from a deeply nested reference on transaction`, () => {
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

    expect.hasAssertions();
    for (let transaction of computatedTest.transactionsComputed) {
      expect(transaction.value.toFixed).toEqual('500.00');
    }
  });

  test(`computes from a single reference on accounts`, () => {
    let computatedTest = create(AppModel, {
      accounts: [
        {
          name: 'credit card',
          starting: 1200,
          vehicle: 'credit line',
          payback: {
            transactions: [
              {
                id: `computated-test`,
                raccount: `account`,
                description: `description`,
                category: `test default`,
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

    expect.hasAssertions();
    for (let transaction of computatedTest.transactionsComputed) {
      // ignore the default transaction
      if (transaction.id.state !== 'seed-data-id') {
        // in credit cards, both transactions are negatives transfers
        expect(transaction.value.toFixed).toEqual('-55.00');
      }
    }
  });

  test(`computes from a nested reference on accounts`, () => {
    let computatedTest = create(AppModel, {
      accounts: [
        {
          name: 'credit card',
          starting: 1200,
          vehicle: 'credit line',
          payback: {
            transactions: [
              {
                id: `computated-test`,
                raccount: `account`,
                description: `description`,
                category: `test default`,
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

    expect.hasAssertions();
    for (let transaction of computatedTest.transactionsComputed) {
      // ignore the default transaction
      if (transaction.id.state !== 'seed-data-id') {
        // in credit cards, both transactions are negatives transfers
        expect(transaction.value.toFixed).toEqual('-160.00');
      }
    }
  });

  test(`computes from a deeply nested reference on accounts`, () => {
    let computatedTest = create(AppModel, {
      accounts: [
        {
          name: 'credit card',
          starting: 1200,
          vehicle: 'credit line',
          payback: {
            transactions: [
              {
                id: `computated-test`,
                raccount: `account`,
                description: `description`,
                category: `test default`,
                start: `2018-03-22`,
                rtype: `day`,
                cycle: 3,
                value: 0,
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

    expect.hasAssertions();
    for (let transaction of computatedTest.transactionsComputed) {
      // ignore the default transaction
      if (transaction.id.state !== 'seed-data-id') {
        // in credit cards, both transactions are negatives transfers
        expect(transaction.value.toFixed).toEqual('-350.00');
      }
    }
  });

  test(`computes the starting reference on accounts`, () => {
    let computatedTest = create(AppModel, {
      accounts: [
        {
          name: 'debt payback starting copy down',
          starting: 3000,
          vehicle: 'credit line',
          payback: {
            transactions: [
              {
                id: `computated-test`,
                raccount: `account`,
                description: `description`,
                category: `test default`,
                start: `2018-03-22`,
                rtype: `day`,
                cycle: 3,
                value: 10,
                references: { statementBalance: 1700 },
                computedAmount: {
                  reference: 'starting',
                  operation: 'minus',
                  on: { reference: 'statementBalance' }
                }
              }
            ]
          }
        }
      ]
    }).reCalc();

    expect.hasAssertions();
    for (let transaction of computatedTest.transactionsComputed) {
      // ignore the default transaction
      if (transaction.id.state !== 'seed-data-id') {
        // since it is a credit line, both should be negative (transfers)
        expect(transaction.value.toFixed).toEqual('-1300.00');
        expect(transaction.type.state).toEqual('transfer');
      }
    }
  });

  test(`copies down the references from payback`, () => {
    let computatedTest = create(AppModel, {
      accounts: [
        {
          name: 'debt payback ref copy down',
          starting: 3000,
          vehicle: 'credit line',
          payback: {
            references: { statementBalance: 1700 },
            transactions: [
              {
                id: `computated-test`,
                raccount: `account`,
                description: `description`,
                category: `test default`,
                start: `2018-03-22`,
                rtype: `day`,
                cycle: 3,
                value: 10,
                computedAmount: {
                  reference: 'starting',
                  operation: 'minus',
                  on: { reference: 'statementBalance' }
                }
              }
            ]
          }
        }
      ]
    }).reCalc();

    expect.hasAssertions();
    for (let transaction of computatedTest.transactionsComputed) {
      // ignore the default transaction
      if (transaction.id.state !== 'seed-data-id') {
        // since it is a credit line, both should be negative (transfers)
        expect(transaction.value.toFixed).toEqual('-1300.00');
        expect(transaction.type.state).toEqual('transfer');
      }
    }
  });
});
