import { resolveBarChart } from './index.js';

const testData = {
  transactions: [
    {
      id: `oasidjas1`,
      raccount: `account`,
      description: `description`,
      category: `test default`,
      type: `income`,
      start: `2018-03-22`,
      rtype: `day`,
      cycle: 3,
      value: 150
    }
  ]
};

describe(`check resolveBarChart`, () => {
  let resolvedTestData = resolveBarChart(testData.transactions);
  it(`has all the correct original properties`, () => {
    expect(resolvedTestData[0]).toHaveProperty('id', 'oasidjas1');
    expect(resolvedTestData[0]).toHaveProperty('raccount', 'account');
    expect(resolvedTestData[0]).toHaveProperty('description', 'description');
    expect(resolvedTestData[0]).toHaveProperty('type', 'income');
    expect(resolvedTestData[0]).toHaveProperty('category', 'test default');
    expect(resolvedTestData[0]).toHaveProperty('start', '2018-03-22');
    expect(resolvedTestData[0]).toHaveProperty('rtype', 'day');
    expect(resolvedTestData[0]).toHaveProperty('cycle', 3);
    expect(resolvedTestData[0]).toHaveProperty('value', 150);
  });

  it(`has the new properties`, () => {
    expect(resolvedTestData[0]).toHaveProperty('dailyRate', 50);
    expect(resolvedTestData[0]).toHaveProperty('maxHeight', 150);
    expect(resolvedTestData[0].stack).toEqual(
      expect.arrayContaining([expect.arrayContaining([0, 0])])
    );
  });
});
