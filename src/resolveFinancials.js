import * as d3 from 'd3';
import getDay from 'date-fns/fp/getDay';
import getDate from 'date-fns/fp/getDate';

const resolveData = data => {
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
        splitTransactions.transfer.push(d);
        break;
      default:
        break;
    }
  });

  let BarChart = resolveBarChart(data.transactions);
  let BarChartIncome = resolveBarChart(splitTransactions.income);
  let BarChartExpense = resolveBarChart(splitTransactions.expense);
  let BarChartTransfer = resolveBarChart(splitTransactions.transfer);
  let AccountChart = resolveAccountChart(data, BarChart);

  return {
    ...data,
    BarChartIncome: BarChartIncome,
    BarChartExpense: BarChartExpense,
    BarChartTransfer: BarChartTransfer,
    AccountChart: AccountChart
  };
};

const sortTransactionOrder = (a, b) => {
  const typeA = a.type.toUpperCase();
  const typeB = b.type.toUpperCase();

  let comparison = 0;
  if (typeA > typeB) {
    comparison = 1;
  } else if (typeA < typeB) {
    comparison = -1;
  }
  return comparison;
};

const resolveBarChart = (data, width) => {
  // return early with an empty array
  // for empty data
  if (!data || data.length === 0) return [];

  let arrData = [];
  let keys = [];

  data.forEach(d => {
    let key = `${d.id}`;
    keys.push(key);
  });

  let numberofFutureDays = daysinfuture(width);
  let graphRange = graphrange(past(), future(numberofFutureDays));
  let minX = min_x(graphRange);
  let maxX = max_x(graphRange);

  for (let i = minX; i <= maxX; i.setDate(i.getDate() + 1)) {
    //create object for stack layout
    let obj = {};
    obj.date = new Date(i);
    data.forEach(d => {
      let key = `${d.id}`;
      obj[key] = { ...d };

      if (convertdate(i) === d.start && d.rtype === 'none') {
        obj[key].y = d.value;
      } else if (convertdate(i) > d.end && d.end !== 'none') {
        obj[key].y = 0;
      } else if (
        d.rtype === 'day' &&
        d.cycle != null &&
        ((i - parseDate(d.start)) / (24 * 60 * 60 * 1000)) % d.cycle < 1
      ) {
        obj[key].y = d.value;
      } else if (
        d.rtype === 'day of week' &&
        convertdate(i) >= d.start &&
        getDay(i) === d.cycle
      ) {
        obj[key].y = d.value;
      } else if (
        d.rtype === 'day of month' &&
        convertdate(i) >= d.start &&
        getDate(i) === d.cycle
      ) {
        obj[key].y = d.value;
      } else {
        obj[key].y = 0;
      }
    });
    arrData.push(obj);
  }

  let stack = d3
    .stack()
    .value((d, key) => d[key].y)
    .keys(keys);

  let stacked = stack(arrData);

  let maxHeight = d3.max(stacked.reduce((a, b) => a.concat(b)), d => d[1]);

  return data.map((entry, index) => ({
    ...entry,
    stack: stacked[index],
    maxHeight: maxHeight
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
    let finalZippedLine = { account: account, values: [] };
    for (let iterator = 0; iterator < arrayLength; iterator++) {
      let prevVal =
        finalZippedLine.values.length === 0
          ? extractValue(
              data.accounts.find(acc => acc.name === account).starting
            )
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

export { resolveBarChart, resolveAccountChart };
export default resolveData;

const daysinfuture = divWidth => {
  if (divWidth > 1000) {
    return 240;
  } else {
    return 120;
  }
};

const margin = () => {
  return { top: 10, right: 20, bottom: 40, left: 40 };
};

const width = (divWidth, margin, daysinfuture) => {
  return;
  divWidth - margin.left - margin.right + daysinfuture * 20;
};

const height = (divWidth, margin) => {
  return d3.min([divWidth * 0.5 - margin.top - margin.bottom, 350]);
};

const shift = (width, daysinfuture) => {
  return width / daysinfuture;
};

const today = () => {
  return new Date();
};

const future = daysinfuture => {
  let future = new Date();
  future.setDate(future.getDate() + daysinfuture);
  return future;
};

const past = () => {
  let past = new Date();
  past.setDate(past.getDate() - 1);
  return past;
};

const graphrange = (past, future) => {
  return [convertdate(past), convertdate(future)];
};

const min_x = graphrange => {
  return parseDate(graphrange[0]);
};

const max_x = graphrange => {
  return parseDate(graphrange[1]);
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
