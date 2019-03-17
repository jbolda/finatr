import { valueOf, create, StringType, DateType } from 'microstates';
import { Big } from './customTypes.js';
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
}

class Income extends Allocations {
  id = StringType;
  group = StringType;
  date = DateType;

  get state() {
    return valueOf(this);
  }
}

class Quarters {
  income = [Income];
  total = Allocations;
  average = Allocations;

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
}

class TaxStrategy {
  incomeReceived = [Income];
  incomeGroup = [IncomeGroup];
  groups = [StringType];

  get state() {
    return valueOf(this);
  }

  reCalc() {
    if (this.incomeReceived.length === 0) return this.incomeGroup.set([]);
    const { incomeReceived } = this.state;

    const groups = incomeReceived.reduce((g, income) => {
      return g.includes(income.group) ? g : [...g, income.group];
    }, []);

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

    const initGroup = groups.map(g => ({
      name: g,
      qOne: { income: [], total: { ...allocationTemplate } },
      qTwo: { income: [], total: { ...allocationTemplate } },
      qThree: { income: [], total: { ...allocationTemplate } },
      qFour: { income: [], total: { ...allocationTemplate } }
    }));

    const incomeGroup = incomeReceived.reduce((iG, income) => {
      return iG.map(g => {
        if (g.name === income.group) {
          const quarter = getQuarter(income.date);
          const quarterText = quarterAsText(quarter);

          g[quarterText].income = [].concat(g[quarterText].income, income);
        }
        return g;
      });
    }, initGroup);

    return this.groups
      .set(groups)
      .incomeGroup.set(incomeGroup)
      .addUpIncome();
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

    const computedIncomeGroup = this.incomeGroup.map(iG => {
      const { qOne, qTwo, qThree, qFour } = iG.state;

      const computedQOneAllocations = qOne.income.reduce(
        (fin, income) => addUpAllAllocations(allocations, 'qOne', fin, income),
        iG.qOne.total
      );

      const computedQTwoAllocations = qTwo.income.reduce(
        (fin, income) => addUpAllAllocations(allocations, 'qTwo', fin, income),
        iG.qTwo.total
      );

      const computedQThreeAllocations = qThree.income.reduce(
        (fin, income) =>
          addUpAllAllocations(allocations, 'qThree', fin, income),
        iG.qThree.total
      );

      const computedQFourAllocations = qFour.income.reduce(
        (fin, income) => addUpAllAllocations(allocations, 'qFour', fin, income),
        iG.qFour.total
      );

      return iG.qOne.total
        .set(computedQOneAllocations)
        .qTwo.total.set(computedQTwoAllocations)
        .qThree.total.set(computedQThreeAllocations)
        .qFour.total.set(computedQFourAllocations);
    }).incomeGroup;

    return this.incomeGroup.set(computedIncomeGroup);
  }
}

export { TaxStrategy };

const quarterAsText = q => {
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
  allocations.forEach(key => {
    next[key] = fin[key].add(income[key])[qKey].total[key];
  });
  return fin.set(next)[qKey].total;
};
