import { Big } from 'big.js';
import getQuarter from 'date-fns/fp/getQuarter/index.js';
import parseISO from 'date-fns/fp/parseISO/index.js';
import { createSelector } from 'starfx';

import { schema } from '~/src/store/schema.ts';

export const taxedIncomeGrouped = createSelector(
  schema.incomeReceived.selectTableAsList,
  (income) => {
    return income.reduce((grouped, income) => {
      if (!grouped?.[income.group]) grouped[income.group] = [];
      grouped[income.group].push(income);
      return grouped;
    }, {});
  }
);

export const incomeExpectedGrouped = createSelector(
  schema.incomeExpected.selectTableAsList,
  (expected) =>
    expected.reduce((exp, item) => {
      if (!exp[item.group]) exp[item.group] = [];
      exp[item.group][item.quarter - 1] = item.quantity;
      return exp;
    }, {})
);

export const taxStrategy = createSelector(
  taxedIncomeGrouped,
  incomeExpectedGrouped,
  (groups, expected) => {
    const allocations = {
      gross: Big(0),
      federalTax: Big(0),
      stateTax: Big(0),
      socialSecurity: Big(0),
      hsa: Big(0),
      pretaxInvestments: Big(0)
    };

    const quarters = [1, 2, 3, 4];

    const incomeGroup = Object.entries(groups).map(
      ([group, incomeReceived]) => {
        const initGroup = quarters.reduce((g, q) => {
          const quarterText = quarterAsText(q);
          g[quarterText] = {};
          g[quarterText].income = [];
          return g;
        }, {});

        const quarteredGroup = incomeReceived.reduce((g, income) => {
          const quarter = getQuarter(parseISO(income.date));
          const quarterText = quarterAsText(quarter);
          g[quarterText].income = [].concat(g[quarterText].income, income);
          return g;
        }, initGroup);

        return { name: group, ...quarteredGroup };
      }
    );

    const computedIncomeGroup = incomeGroup.map((iG) => {
      for (const q of quarters) {
        const quarterText = quarterAsText(q);
        const income = iG[quarterText].income;
        iG[quarterText].total = processAllocations(
          'total',
          allocations,
          income
        );
        iG[quarterText].average = processAllocations(
          'average',
          allocations,
          income
        );
        iG[quarterText].projected = processAllocations(
          'projected',
          allocations,
          income,
          expected?.[iG.name]?.[q - 1]
        );
      }
      return iG;
    });

    return computedIncomeGroup;
  }
);

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

const processAllocations = (key, allocations, income, expected?: number) => {
  return income.reduce(
    (fin, inc) => {
      for (const a of Object.keys(allocations)) {
        if (key === 'total') {
          fin[a] = fin[a].add(inc[a]);
        } else if (key === 'average') {
          fin[a] = fin[a].add(inc[a].div(income.length));
        } else if (key === 'projected') {
          fin[a] = fin[a].add(
            inc[a].div(income.length).times(expected ?? income.length)
          );
        }
      }
      return fin;
    },
    { ...allocations }
  );
};

export const taxStrategyAsList = createSelector(taxStrategy, (strategy) => {
  const quarters = [1, 2, 3, 4];
  // const allocations = ['total', 'average', 'projected']
  const allocations = [
    'gross',
    'federalTax',
    'stateTax',
    'socialSecurity',
    'hsa',
    'pretaxInvestments'
  ];
  const values = ['total', 'average', 'projected'];
  return strategy.flatMap((income) =>
    quarters.flatMap((q) => {
      const quarterText = quarterAsText(q);
      return values.map((v) => {
        const allocated = allocations.reduce((allocation, key) => {
          allocation[key] = income[quarterText][v][key];
          return allocation;
        }, {});
        return {
          group: income.name,
          quarter: quarterText,
          type: v,
          ...allocated
        };
      });
    })
  );
});
