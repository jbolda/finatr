import { valueOf, StringType, DateType } from 'microstates';
import { Big } from './customTypes.js';
import getQuarter from 'date-fns/fp/getQuarter';

class Income {
  id = StringType;
  group = StringType;
  date = DateType;
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

class Quarters {
  qOne = [Income];
  qTwo = [Income];
  qThree = [Income];
  qFour = [Income];
}

class IncomeGroup {
  name = StringType;
  income = Quarters;
  values = Big;
}

class TaxStrategy {
  incomeReceived = [Income];
  incomeGroup = [IncomeGroup];
  groups = [StringType];

  get state() {
    return valueOf(this);
  }

  reCalc() {
    if (this.incomeReceived.length === 0) return this;
    const { incomeReceived } = this.state;

    const groups = incomeReceived.reduce((g, income) => {
      return g.includes(income.group) ? g : [...g, income.group];
    }, []);

    const initGroup = groups.map(g => ({
      name: g,
      income: { qOne: [], qTwo: [], qThree: [], qFour: [] }
    }));

    const incomeGroup = incomeReceived.reduce((iG, income) => {
      return iG.map(g => {
        if (g.name === income.group) {
          const quarter = getQuarter(income.date);
          g.income[quarterAsText(quarter)] = [].concat(
            g.income[quarterAsText(quarter)],
            income
          );
        }
        return g;
      });
    }, initGroup);

    return this.groups.set(groups).incomeGroup.set(incomeGroup);
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
