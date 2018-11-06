import * as d3 from 'd3';
import Big from 'big.js';
import eachDayOfInterval from 'date-fns/fp/eachDayOfInterval';
import closestIndexTo from 'date-fns/closestIndexTo';
import addDays from 'date-fns/fp/addDays';
import startOfDay from 'date-fns/fp/startOfDay';

import computeTransactionModifications from './resolveTransactions.js';

const sortTransactionOrder = (a, b) => {
  const typeA = a.type.toUpperCase();
  const typeB = b.type.toUpperCase();

  let comparison = 0;
  if (typeA === typeB) {
    if (Math.abs(a.value) > Math.abs(b.value)) {
      comparison = 1;
    } else {
      comparison = -1;
    }
  } else if (typeA > typeB) {
    comparison = 1;
  } else if (typeA < typeB) {
    comparison = -1;
  }
  return comparison;
};

const transactionSplitter = ({ transactions, accounts }) => {
  let splitTransactions = {
    income: [],
    expense: []
  };

  if (transactions) {
    transactions.forEach(d => {
      switch (d.type) {
        case 'income':
          splitTransactions.income.push(d);
          break;
        case 'expense':
          splitTransactions.expense.push(d);
          break;
        case 'transfer':
          if (d.value <= 0) {
            splitTransactions.expense.push(d);
          } else {
            splitTransactions.income.push(d);
          }
          break;
        default:
          break;
      }
    });
  }
  if (accounts) {
    accounts.forEach(account => {
      if (account.vehicle === 'debt' && account.payback) {
        let accountTransactionPush = [];
        account.payback.transactions.forEach((accountTransaction, index) => {
          // this one is for the expense on the account
          // being paid down
          let amount =
            typeof accountTransaction.value === 'string'
              ? account.payback[accountTransaction.value]
              : accountTransaction.value;
          accountTransactionPush.push({
            ...accountTransaction,
            id: `${account.payback.id}-${index}EXP`,
            raccount: account.name,
            description: account.payback.description,
            type: account.payback.type,
            category: account.payback.category,
            value: amount
          });
          // this one is for the account making the payment
          // (raccount is defined on accountTransaction)
          accountTransactionPush.push({
            ...accountTransaction,
            id: `${account.payback.id}-${index}TRSF`,
            description: account.payback.description,
            type: 'transfer',
            category: account.payback.category,
            value: -amount
          });
        });
        splitTransactions.expense.push(accountTransactionPush);
      }
    });
  }

  return splitTransactions;
};

const resolveBarChart = (dataRaw, { graphRange }) => {
  // return early with an empty array
  // for empty data
  if (!dataRaw || dataRaw.length === 0) return [];

  let keys = [];

  dataRaw.forEach((d, i) => {
    if (Array.isArray(d)) {
      d.forEach((d2, i2) => {
        let key = { value: d2.id, index: i, indexNested: i2 };
        keys.push(key);
      });
    } else {
      let key = { value: d.id, index: i };
      keys.push(key);
    }
  });

  // we coerce into Big here temporarily
  // eventually we need to except it to already be Big
  let data = keys.map(key => {
    let dataAccess = Array.isArray(dataRaw[key.index])
      ? dataRaw[key.index][key.indexNested]
      : dataRaw[key.index];
    let newDatum = { ...dataAccess };
    if (newDatum.value) {
      newDatum.value = Big(dataAccess.value);
    }
    if (newDatum.cycle) {
      newDatum.cycle = Big(dataAccess.cycle);
    }
    if (newDatum.generatedOccurrences) {
      newDatum.generatedOccurrences = Big(dataAccess.generatedOccurrences);
    }
    if (newDatum.visibleOccurrences) {
      newDatum.visibleOccurrences = Big(dataAccess.visibleOccurrences);
    }
    return newDatum;
  });

  let allDates = eachDayOfInterval(graphRange);
  let stackStructure = allDates.map(day => {
    let obj = { date: day };
    data.forEach(datum => {
      obj[datum.id] = { ...datum };
      obj[datum.id].y = Big(0);
      obj[datum.id].dailyRate = Big(0);
    });
    return obj;
  });

  const replaceWithModified = (oldValue, modification) => {
    let newValue = oldValue;
    newValue.y = oldValue.y.add(modification.y);
    newValue.dailyRate = oldValue.dailyRate.add(modification.dailyRate);
    return newValue;
  };

  // return array of modifications to be applied to stackStructure
  let stackComputed = computeTransactionModifications(data, graphRange).reduce(
    (structure, modification) => {
      let modIndex = closestIndexTo(modification.date, allDates);
      let updatedStructure = structure;
      updatedStructure[modIndex][modification.mutateKey] = replaceWithModified(
        updatedStructure[modIndex][modification.mutateKey],
        modification
      );
      return updatedStructure;
    },
    stackStructure
  );

  let stack = d3
    .stack()
    .value((d, key) => d[key.value].y)
    .keys(keys);

  let stacked = stack(stackComputed);

  let maxHeight = d3.max(stacked.reduce((a, b) => a.concat(b)), d => d[1]);

  return keys.map((key, index) => ({
    ...stackComputed[0][key.value],
    stack: stacked[index],
    maxHeight: Big(maxHeight),
    dailyRate: d3.max(stackComputed, d => d[key.value].dailyRate)
  }));
};

const resolveAccountChart = ({ accounts, income, expense }) => {
  return accounts
    ? accounts.map(account => {
        let accountStack = {};

        const zipTogethor = arr =>
          arr.reduce((accumlator, d) => {
            let flatten = d.stack.map(e => e[1] - e[0]);
            return accumlator.length === 0
              ? flatten
              : accumlator.map((d, i, thisArray) => d + flatten[i]);
          }, []);

        const extractValue = value => {
          if (value === undefined) {
            return 0;
          } else {
            return value;
          }
        };

        accountStack.income = zipTogethor(income);
        accountStack.expense = zipTogethor(expense);

        let arrayLength = Math.max(
          accountStack.income.length,
          accountStack.expense.length
        );

        let finalZippedLine = {
          account: account,
          values: [],
          interest: account.interest,
          vehicle: account.vehicle
        };

        for (let iterator = 0; iterator < arrayLength; iterator++) {
          let prevVal =
            finalZippedLine.values.length === 0
              ? extractValue(account.starting)
              : extractValue(
                  finalZippedLine.values[finalZippedLine.values.length - 1]
                    .value
                );
          let firstStep =
            prevVal - extractValue(accountStack.expense[iterator]);
          let secondStep =
            firstStep + extractValue(accountStack.income[iterator]);
          finalZippedLine.values.push({
            date: [].concat(income, expense)[0].stack[iterator].data.date,
            value: firstStep
          });
          finalZippedLine.values.push({
            date: [].concat(income, expense)[0].stack[iterator].data.date,
            value: secondStep
          });
        }
        return finalZippedLine;
      })
    : [];
};

export {
  sortTransactionOrder,
  transactionSplitter,
  resolveBarChart,
  resolveAccountChart
};

const future = daysinfuture => {
  return addDays(daysinfuture)(startOfDay(new Date()));
};

const past = () => {
  return addDays(1)(startOfDay(new Date()));
};

export { past, future };
