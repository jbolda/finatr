import { create } from 'microstates';
import AppModel from './../state';
import startOfDay from 'date-fns/fp/startOfDay';

import { testData } from './resolveFinancials/index.testdata.js';

let graphRange = {
  start: startOfDay('2018-03-01'),
  end: startOfDay('2018-09-01')
};
testData.charts = {};
testData.charts.GraphRange = graphRange;

let resolvedTestData = create(AppModel, testData).reCalc();

describe(`transaction array changes`, () => {
  it(`has the correct length when an item is deleted`, () => {
    expect(resolvedTestData.transactionsComputed).toHaveLength(11);
    const modTestData = resolvedTestData.deleteTransaction(`oasidjas1`);
    expect(modTestData.transactionsComputed).toHaveLength(10);
  });
});
