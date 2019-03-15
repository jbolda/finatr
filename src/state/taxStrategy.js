import { valueOf, StringType, DateType } from 'microstates';
import { Big } from './customTypes.js';
import getQuarter from 'date-fns/fp/getQuarter';

class Allocations {
  gross = Big;
  federalTax = Big;
  stateTax = Big;
  socialSecurity = Big;
  hsa = Big;
  pretaxInvestments = Big;

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
  qOne = [Income];
  qOneAllocations = Allocations;
  qTwo = [Income];
  qTwoAllocations = Allocations;
  qThree = [Income];
  qThreeAllocations = Allocations;
  qFour = [Income];
  qFourAllocations = Allocations;

  get state() {
    return valueOf(this);
  }
}

class IncomeGroup {
  name = StringType;
  income = Quarters;

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
      income: {
        qOne: [],
        qOneAllocations: { ...allocationTemplate },
        qTwo: [],
        qTwoAllocations: { ...allocationTemplate },
        qThree: [],
        qThreeAllocations: { ...allocationTemplate },
        qFour: [],
        qFourAllocations: { ...allocationTemplate }
      }
    }));

    const incomeGroup = incomeReceived.reduce((iG, income) => {
      return iG.map(g => {
        if (g.name === income.group) {
          const quarter = getQuarter(income.date);
          const quarterText = quarterAsText(quarter);

          g.income[quarterText] = [].concat(g.income[quarterText], income);
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
      const { qOne, qTwo, qThree, qFour } = iG.income.state;

      const computedQOneAllocations = qOne.reduce(
        (fin, income) =>
          addUpAllAllocations(allocations, 'qOneAllocations', fin, income),
        iG.income.qOneAllocations
      );

      const computedQTwoAllocations = qTwo.reduce(
        (fin, income) =>
          addUpAllAllocations(allocations, 'qTwoAllocations', fin, income),
        iG.income.qTwoAllocations
      );

      const computedQThreeAllocations = qThree.reduce(
        (fin, income) =>
          addUpAllAllocations(allocations, 'qThreeAllocations', fin, income),
        iG.income.qThreeAllocations
      );

      const computedQFourAllocations = qFour.reduce(
        (fin, income) =>
          addUpAllAllocations(allocations, 'qFourAllocations', fin, income),
        iG.income.qFourAllocations
      );

      return iG.income.qOneAllocations
        .set(computedQOneAllocations)
        .income.qTwoAllocations.set(computedQTwoAllocations)
        .income.qThreeAllocations.set(computedQThreeAllocations)
        .income.qFourAllocations.set(computedQFourAllocations);
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
    next[key] = fin[key].add(income[key]).income[qKey][key];
  });
  return fin.set(next).income[qKey];
};
