import * as d3 from 'd3';
import eachDayOfInterval from 'date-fns/fp/eachDayOfInterval';
import closestIndexTo from 'date-fns/closestIndexTo';
import addDays from 'date-fns/fp/addDays';
import startOfDay from 'date-fns/fp/startOfDay';

import computeTransactionModifications from './resolveTransactions.js';

const resolveData = data => {
  let graphRange = { start: past(), end: future(365) };
  return resolveDataAtDateRange(data, graphRange);
};

const resolveDataAtDateRange = (data, graphRange) => {
  data.transactions.sort(sortTransactionOrder);

  let splitTransactions = {
    income: [],
    expense: [],
    transfer: []
  };
  data.transactions.forEach(d => {
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
  data.accounts.forEach(account => {
    if (account.vehicle === 'debt' && account.payback) {
      splitTransactions.expense.push([...account.payback]);
    }
  });

  let BarChart = resolveBarChart(data.transactions, { graphRange });
  let BarChartIncome = resolveBarChart(splitTransactions.income, {
    graphRange
  });
  let BarChartExpense = resolveBarChart(splitTransactions.expense, {
    graphRange
  });
  let AccountChart = resolveAccountChart(data, BarChart);

  const extractValue = value => {
    if (value === undefined) {
      return 0;
    } else {
      return value;
    }
  };
  let max_domain_bars = d3.max([
    extractValue(BarChartIncome[0] ? BarChartIncome[0].maxHeight : 0),
    extractValue(BarChartExpense[0] ? BarChartExpense[0].maxHeight : 0)
  ]);

  let max_domain_line = d3.max(AccountChart, d =>
    d3.max(d.values, d => d.value)
  );

  let dailyIncome = d3.sum(
    BarChartIncome,
    d => (d.type === 'income' ? d.dailyRate : 0)
  );
  let dailyExpense = d3.sum(
    BarChartExpense,
    d => (d.type === 'expense' ? d.dailyRate : 0)
  );

  const sumInvest = d => {
    let accountRaw = data.accounts.find(acc => acc.name === d.raccount);

    if (accountRaw && accountRaw.vehicle === 'investment') {
      return d.dailyRate;
    } else {
      return 0;
    }
  };
  let dailyInvest = d3.sum(BarChartIncome, sumInvest);

  let totalInvest = d3.sum(data.accounts, d => {
    if (d.vehicle === 'investment') {
      return d.starting;
    } else {
      return 0;
    }
  });

  return {
    ...data,
    BarChartIncome: BarChartIncome,
    BarChartExpense: BarChartExpense,
    BarChartMax: max_domain_bars,
    dailyIncome: dailyIncome,
    dailyExpense: dailyExpense,
    savingsRate: (100 * dailyInvest) / dailyExpense,
    fiNumber: (100 * totalInvest) / (dailyExpense * 365) / 25,
    AccountChart: AccountChart,
    LineChartMax: max_domain_line
  };
};

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

const resolveBarChart = (data, { graphRange }) => {
  // return early with an empty array
  // for empty data
  if (!data || data.length === 0) return [];

  let keys = [];

  data.forEach((d, i) => {
    let key = { value: `${d.id ? d.id : d[0].id}`, index: i };
    keys.push(key);
  });

  let allDates = eachDayOfInterval(graphRange);
  let stackStructure = allDates.map(day => {
    let obj = { date: day };
    keys.forEach(key => {
      obj[key.value] = Array.isArray(data[key.index])
        ? { ...data[key.index][0] }
        : { ...data[key.index] };
      obj[key.value].y = 0;
      obj[key.value].dailyRate = 0;
    });
    return obj;
  });

  const replaceWithModified = (oldValue, modification) => {
    let newValue = oldValue;
    newValue.y += modification.y;
    newValue.dailyRate += modification.dailyRate;
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
    maxHeight: maxHeight,
    dailyRate: d3.max(stackComputed, d => d[key.value].dailyRate)
  }));
};

const resolveAccountChart = (data, dataMassaged) => {
  let accounts = data.transactions
    .map(d => d.raccount)
    .filter((d, i, a) => a.indexOf(d) === i);

  return accounts.map(account => {
    let acc = {
      income: [],
      expense: [],
      transfer: []
    };
    dataMassaged.forEach(d => {
      if (d.raccount === account) {
        switch (d.type) {
          case 'income':
            acc.income.push(d.stack);
            break;
          case 'expense':
            acc.expense.push(d.stack);
            break;
          case 'transfer':
            acc.transfer.push(d.stack);
            break;
          default:
            break;
        }
      }
    });

    let accountStack = {};
    const zipTogethor = array =>
      array.reduce((accumlator, d) => {
        let flatten = d.map(e => e[1] - e[0]);
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

    accountStack.income = zipTogethor(acc.income);
    accountStack.expense = zipTogethor(acc.expense);
    accountStack.transfer = zipTogethor(acc.transfer);
    let arrayLength = Math.max(
      accountStack.income.length,
      accountStack.expense.length,
      accountStack.transfer.length
    );
    let accountRaw = data.accounts.find(acc => acc.name === account);
    let finalZippedLine = {
      account: account,
      values: [],
      interest: accountRaw.interest,
      vehicle: accountRaw.vehicle
    };
    for (let iterator = 0; iterator < arrayLength; iterator++) {
      let prevVal =
        finalZippedLine.values.length === 0
          ? extractValue(accountRaw.starting)
          : extractValue(
              finalZippedLine.values[finalZippedLine.values.length - 1].value
            );
      let firstStep = prevVal - extractValue(accountStack.expense[iterator]);
      let secondStep =
        firstStep +
        extractValue(accountStack.income[iterator]) +
        extractValue(accountStack.transfer[iterator]);
      finalZippedLine.values.push({
        date: dataMassaged[0].stack[iterator].data.date,
        value: firstStep
      });
      finalZippedLine.values.push({
        date: dataMassaged[0].stack[iterator].data.date,
        value: secondStep
      });
    }
    return finalZippedLine;
  });
};

export { resolveDataAtDateRange, resolveBarChart, resolveAccountChart };
export default resolveData;

const future = daysinfuture => {
  return addDays(daysinfuture)(startOfDay(new Date()));
};

const past = () => {
  return addDays(1)(startOfDay(new Date()));
};

// function to convert javascript dates into a pretty format (i.e. '2014-12-03')
const convertdate = date => {
  let dd = date.getDate();
  let mm = date.getMonth() + 1; //January is 0!
  let yyyy = date.getFullYear();

  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }

  return yyyy + '-' + mm + '-' + dd;
};

const parseDate = date => {
  return d3.timeParse('%Y-%m-%d')(date);
};

export { past, future };
