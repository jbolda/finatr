import { valueOf, create, StringType, DateType } from 'microstates';
import { Big } from './customTypes.js';
import parseISO from 'date-fns/fp/parseISO';
import getQuarter from 'date-fns/fp/getQuarter';

class Allocations {
  gross = create(Big, 0);
  federalTax = create(Big, 0);
  stateTax = create(Big, 0);
  socialSecurity = create(Big, 0);
  hsa = create(Big, 0);
  pretaxInvestments = create(Big, 0);

  get state() {
    return valueOf(this);
  }

  setAll(obj = {}) {
    let next = this;
    Object.keys(obj).forEach((key) => {
      next = next[key].set(obj[key]);
    });
    return next;
  }

  timesAll(value) {
    let next = this;
    Object.keys(this.state).forEach((key) => {
      next = next[key].times(value);
    });
    return next;
  }

  averageAll(total, quantity) {
    if (quantity === 0) return this;
    let next = this;
    Object.keys(this.state).forEach((key) => {
      next = next[key].set(total[key])[key].div(quantity);
    });
    return next;
  }
}

class Income extends Allocations {
  id = StringType;
  date = DateType;
}

class IncomeList {
  group = StringType;
  income = [Income];
}

class Quarters {
  income = [Income];
  quantity = Big;
  total = Allocations;
  average = Allocations;
  projected = Allocations;

  get state() {
    return valueOf(this);
  }
}

class IncomeGroup {
  name = StringType;
  qOne = Quarters;
  qTwo = Quarters;
  qThree = Quarters;
  qFour = Quarters;

  get state() {
    return valueOf(this);
  }

  setEachQuarter(quarters = [], key) {
    if (quarters.length === 0) return this;
    return this.qOne[key]
      .setAll(quarters[0][key])
      .qTwo[key].setAll(quarters[1][key])
      .qThree[key].setAll(quarters[2][key])
      .qFour[key].setAll(quarters[3][key]);
  }
}

class TaxStrategy {
  incomeReceived = [IncomeList];
  incomeGroup = [IncomeGroup];
  groups = [StringType];

  get state() {
    return valueOf(this);
  }

  reCalc() {
    if (this.incomeReceived.length === 0) return this.incomeGroup.set([]);
    const { incomeReceived } = this.state;

    const groups = incomeReceived.reduce(
      (g, income) => [...g, income.group],
      []
    );

    const allocations = [
      'gross',
      'federalTax',
      'stateTax',
      'socialSecurity',
      'hsa',
      'pretaxInvestments'
    ];
    const allocationTemplate = allocations.reduce((acc, val) => {
      acc[val] = 0;
      return acc;
    }, {});

    const quarters = [1, 2, 3, 4];

    const incomeGroup = incomeReceived.map((singleGroup) => {
      const { group, quantity } = singleGroup;

      const initGroup = quarters.reduce((g, q) => {
        const quarterText = quarterAsText(q);
        g[quarterText] = {};
        g[quarterText].income = [];
        g[quarterText].total = { ...allocationTemplate };
        g[quarterText].average = { ...allocationTemplate };
        g[quarterText].projected = { ...allocationTemplate };
        return g;
      }, {});

      const quarteredGroup = singleGroup.income.reduce((g, income) => {
        const quarter = getQuarter(parseISO(income.date));
        const quarterText = quarterAsText(quarter);
        g[quarterText].income = [].concat(g[quarterText].income, income);
        return g;
      }, initGroup);

      const distributed = quarters.reduce((grouped, quarter) => {
        const quarterText = quarterAsText(quarter);
        grouped[quarterText].quantity = quantity[quarter - 1];
        return grouped;
      }, quarteredGroup);

      return { name: group, ...distributed };
    });

    return this.groups.set(groups).incomeGroup.set(incomeGroup).addUpIncome();
  }

  addUpIncome() {
    if (this.incomeGroup.length === 0) return this;
    const allocations = [
      'gross',
      'federalTax',
      'stateTax',
      'socialSecurity',
      'hsa',
      'pretaxInvestments'
    ];

    const computedIncomeGroup = this.incomeGroup.map((iG) => {
      const { qOne, qTwo, qThree, qFour } = iG.state;
      const quarters = ['qOne', 'qTwo', 'qThree', 'qFour'];

      const qVals = [qOne, qTwo, qThree, qFour].map((quarter, index) => {
        const quarterName = quarters[index];

        const total = quarter.income.reduce(
          (fin, income) =>
            addUpAllAllocations(allocations, quarterName, fin, income),
          iG[quarterName].total
        );

        const average = iG[quarterName].average.averageAll(
          total,
          quarter.income.length
        )[quarterName].average;

        // because prettier sets it this way....
        const projected = iG[quarterName].projected
          .setAll(average)
          // eslint-disable-next-line
          [quarterName].projected.timesAll(quarter.quantity)[
          quarterName
        ].projected;

        return { total, average, projected };
      });

      return iG
        .setEachQuarter(qVals, 'total')
        .setEachQuarter(qVals, 'average')
        .setEachQuarter(qVals, 'projected');
    }).incomeGroup;

    return this.incomeGroup.set(computedIncomeGroup);
  }
}

export { TaxStrategy };

const quarterAsText = (q) => {
  switch (q) {
    case 1:
      return 'qOne';
    case 2:
      return 'qTwo';
    case 3:
      return 'qThree';
    case 4:
      return 'qFour';
    default:
      return 'qOne';
  }
};

const addUpAllAllocations = (allocations, qKey, fin, income) => {
  let next = {};
  allocations.forEach((key) => {
    next[key] = fin[key].add(income[key])[qKey].total[key];
  });
  return fin.setAll(next)[qKey].total;
};
