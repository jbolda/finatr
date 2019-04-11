import { create } from 'microstates';
import { TaxStrategy } from './taxStrategy.js';

import Big from 'big.js';

const testData = {
  incomeReceived: [
    {
      group: 'Paycheck One',
      quantity: [7, 6, 7, 6],
      income: [
        {
          id: 'P1-2019-01-04',
          date: '2019-01-04',
          federalTax: 100,
          gross: 1000,
          hsa: 120,
          pretaxInvestments: 150,
          socialSecurity: 140,
          medicare: 30,
          stateTax: 80
        },
        {
          id: 'P1-2019-01-18',
          date: '2019-01-18',
          federalTax: 110,
          gross: 1500,
          hsa: 120,
          pretaxInvestments: 250,
          socialSecurity: 140,
          medicare: 30,
          stateTax: 80
        }
      ]
    },
    {
      group: 'Paycheck Two',
      quantity: [7, 6, 7, 6],
      income: [
        {
          id: 'P2-2019-01-04',
          date: '2019-01-04',
          federalTax: 150,
          gross: 1800,
          hsa: 160,
          pretaxInvestments: 210,
          socialSecurity: 190,
          medicare: 50,
          stateTax: 110
        },
        {
          id: 'P2-2019-01-18',
          date: '2019-01-18',
          federalTax: 140,
          gross: 1200,
          hsa: 130,
          pretaxInvestments: 180,
          socialSecurity: 140,
          medicare: 45,
          stateTax: 90
        },
        {
          id: 'P2-2019-01-18',
          date: '2019-01-18',
          federalTax: 220,
          gross: 3000,
          hsa: 140,
          pretaxInvestments: 260,
          socialSecurity: 210,
          medicare: 65,
          stateTax: 130
        }
      ]
    }
  ]
};

const model = create(TaxStrategy, testData).reCalc();

describe(`check taxStrategy state creation`, () => {
  it(`has the correct top level properties`, () => {
    expect(model.state).toHaveProperty('incomeReceived');
    expect(model.state).toHaveProperty('incomeGroup');
    expect(model.state).toHaveProperty('groups');
  });

  it(`has the right groups`, () => {
    expect(model.state.groups).toEqual(['Paycheck One', 'Paycheck Two']);
  });

  it(`has the correct IncomeGroup properties`, () => {
    expect(model.state.incomeGroup[0]).toHaveProperty('name', 'Paycheck One');
    expect(model.state.incomeGroup[0]).toHaveProperty('qOne');
    expect(model.state.incomeGroup[0]).toHaveProperty('qTwo');
    expect(model.state.incomeGroup[0]).toHaveProperty('qThree');
    expect(model.state.incomeGroup[0]).toHaveProperty('qFour');

    expect(model.state.incomeGroup[1]).toHaveProperty('name', 'Paycheck Two');
    expect(model.state.incomeGroup[1]).toHaveProperty('qOne');
    expect(model.state.incomeGroup[1]).toHaveProperty('qTwo');
    expect(model.state.incomeGroup[1]).toHaveProperty('qThree');
    expect(model.state.incomeGroup[1]).toHaveProperty('qFour');
  });

  it(`has the correct Quarter properties`, () => {
    // push incomeGroup into an array without
    // destroying the underlying Microstate
    // if we would use model.state so we can access
    // values using toFixed, as that is how we will
    // access them in the component
    let income = [];
    let i = 0;
    for (let item of model.incomeGroup) {
      income[i] = item;
      i++;
    }

    expect(income[0].qOne.quantity.toFixed).toBe('7.00');
    expect(income[0].qTwo.quantity.toFixed).toBe('6.00');
    expect(income[0].qThree.quantity.toFixed).toBe('7.00');
    expect(income[0].qFour.quantity.toFixed).toBe('6.00');

    expect(income[1].qOne.quantity.toFixed).toBe('7.00');
    expect(income[1].qTwo.quantity.toFixed).toBe('6.00');
    expect(income[1].qThree.quantity.toFixed).toBe('7.00');
    expect(income[1].qFour.quantity.toFixed).toBe('6.00');

    expect(income[0].qOne.total).toBeDefined();
    expect(income[0].qTwo.total).toBeDefined();
    expect(income[0].qThree.total).toBeDefined();
    expect(income[0].qFour.total).toBeDefined();

    expect(income[1].qOne.total).toBeDefined();
    expect(income[1].qTwo.total).toBeDefined();
    expect(income[1].qThree.total).toBeDefined();
    expect(income[1].qFour.total).toBeDefined();

    expect(income[0].qOne.average).toBeDefined();
    expect(income[0].qTwo.average).toBeDefined();
    expect(income[0].qThree.average).toBeDefined();
    expect(income[0].qFour.average).toBeDefined();

    expect(income[1].qOne.average).toBeDefined();
    expect(income[1].qTwo.average).toBeDefined();
    expect(income[1].qThree.average).toBeDefined();
    expect(income[1].qFour.average).toBeDefined();

    expect(income[0].qOne.projected).toBeDefined();
    expect(income[0].qTwo.projected).toBeDefined();
    expect(income[0].qThree.projected).toBeDefined();
    expect(income[0].qFour.projected).toBeDefined();

    expect(income[1].qOne.projected).toBeDefined();
    expect(income[1].qTwo.projected).toBeDefined();
    expect(income[1].qThree.projected).toBeDefined();
    expect(income[1].qFour.projected).toBeDefined();
  });

  it(`has the correct total gross values`, () => {
    // push incomeGroup into an array without
    // destroying the underlying Microstate
    // if we would use model.state so we can access
    // values using toFixed, as that is how we will
    // access them in the component
    let income = [];
    let i = 0;
    for (let item of model.incomeGroup) {
      income[i] = item;
      i++;
    }

    expect(income[0].qOne.total.gross.toFixed).toBe('2500.00');
    expect(income[0].qTwo.total.gross.toFixed).toBe('0.00');
    expect(income[0].qThree.total.gross.toFixed).toBe('0.00');
    expect(income[0].qFour.total.gross.toFixed).toBe('0.00');

    expect(income[1].qOne.total.gross.toFixed).toBe('6000.00');
    expect(income[1].qTwo.total.gross.toFixed).toBe('0.00');
    expect(income[1].qThree.total.gross.toFixed).toBe('0.00');
    expect(income[1].qFour.total.gross.toFixed).toBe('0.00');
  });

  it(`has the correct average gross values`, () => {
    // push incomeGroup into an array without
    // destroying the underlying Microstate
    // if we would use model.state so we can access
    // values using toFixed, as that is how we will
    // access them in the component
    let income = [];
    let i = 0;
    for (let item of model.incomeGroup) {
      income[i] = item;
      i++;
    }

    expect(income[0].qOne.average.gross.toFixed).toBe('1250.00');
    expect(income[0].qTwo.average.gross.toFixed).toBe('0.00');
    expect(income[0].qThree.average.gross.toFixed).toBe('0.00');
    expect(income[0].qFour.average.gross.toFixed).toBe('0.00');

    expect(income[1].qOne.average.gross.toFixed).toBe('2000.00');
    expect(income[1].qTwo.average.gross.toFixed).toBe('0.00');
    expect(income[1].qThree.average.gross.toFixed).toBe('0.00');
    expect(income[1].qFour.average.gross.toFixed).toBe('0.00');
  });

  it(`has the correct projected gross values`, () => {
    // push incomeGroup into an array without
    // destroying the underlying Microstate
    // if we would use model.state so we can access
    // values using toFixed, as that is how we will
    // access them in the component
    let income = [];
    let i = 0;
    for (let item of model.incomeGroup) {
      income[i] = item;
      i++;
    }

    // it is quantity * average = 1250 * 7 = 8750
    expect(income[0].qOne.projected.gross.toFixed).toBe('8750.00');
    expect(income[0].qTwo.projected.gross.toFixed).toBe('0.00');
    expect(income[0].qThree.projected.gross.toFixed).toBe('0.00');
    expect(income[0].qFour.projected.gross.toFixed).toBe('0.00');

    // 1500 * 7 = 15750
    expect(income[1].qOne.projected.gross.toFixed).toBe('14000.00');
    expect(income[1].qTwo.projected.gross.toFixed).toBe('0.00');
    expect(income[1].qThree.projected.gross.toFixed).toBe('0.00');
    expect(income[1].qFour.projected.gross.toFixed).toBe('0.00');
  });
});
