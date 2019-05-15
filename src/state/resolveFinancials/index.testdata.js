import Big from 'big.js';

let data = [];
let dOne = {
  id: `oasidjas1`,
  raccount: `account`,
  description: `description`,
  category: `test default`,
  type: `income`,
  start: `2018-03-22`,
  rtype: `day`,
  cycle: 3,
  value: 150
};
// daily rate of 50
// cumulative income of 50
data.push(dOne);
let dTwo = {
  id: `oasis2`,
  raccount: `account`,
  description: `description`,
  category: `test default`,
  type: `income`,
  start: `2018-03-22`,
  rtype: `day`,
  cycle: 1,
  value: 100
};
// daily rate of 100
// cumulative income of 150
data.push(dTwo);
let dThree = {
  id: `oasis3`,
  raccount: `account`,
  description: `description`,
  category: `test complex`,
  type: `income`,
  start: `2018-03-22`,
  rtype: `day of week`,
  cycle: 2,
  value: 70
};
// daily rate of 10
// cumulative income of 160
data.push(dThree);
let dFour = {
  id: `oasis6`,
  raccount: `account`,
  description: `description`,
  category: `test complex`,
  type: `income`,
  start: `2018-03-22`,
  rtype: `day of month`,
  cycle: 1,
  value: 90
};
// daily rate of 3
// cumulative income of 163
data.push(dFour);
let dThreePointFive = {
  id: `oasis92hoogyboogy`,
  raccount: `account`,
  description: `description`,
  category: `test complex`,
  type: `income`,
  start: `2018-09-22`,
  rtype: `none`,
  value: 190
};
// daily rate of 0
// cumulative income of 163
data.push(dThreePointFive);
let dFive = {
  id: `oasis8`,
  raccount: `account`,
  description: `description`,
  category: `test comp`,
  type: `expense`,
  start: `2018-03-22`,
  rtype: `day`,
  cycle: 1,
  value: 110
};
// daily rate of 110
// cumulative expense of 110
data.push(dFive);
let dSix = {
  id: `oasis8asg`,
  raccount: `account2`,
  description: `description`,
  category: `test comp`,
  type: `transfer`,
  start: `2018-03-22`,
  rtype: `day`,
  cycle: 1,
  value: 120
};
data.push(dSix);

let testData = {
  transactions: data,
  accounts: [
    {
      name: 'account',
      starting: 3000,
      interest: 0.01,
      vehicle: 'operating'
    },
    {
      name: 'account2',
      starting: 30000,
      interest: 0.01,
      vehicle: 'investment'
    },
    {
      name: 'account3',
      starting: 30000,
      interest: 6.0,
      vehicle: 'debt',
      payback: {
        description: `payback`,
        category: 'account3 payback',
        transactions: [
          {
            id: `payback1-test`,
            raccount: 'account',
            start: `2018-03-22`,
            rtype: `day`,
            cycle: 1,
            value: 140
          },
          {
            id: `payback2-test`,
            raccount: 'account',
            start: `2018-03-22`,
            rtype: `day`,
            cycle: 3,
            value: 60
          }
        ]
      }
    }
  ]
};
// paybacks give daily rate of 140 and 20
// cumulative expense of 270

export { testData };

let testData2 = [
  {
    id: `test-data-2`,
    raccount: `account`,
    description: `description`,
    category: `test default`,
    type: `income`,
    start: `2018-03-22`,
    rtype: `day`,
    cycle: Big(3),
    value: Big(150),
    dailyRate: Big(50)
  }
];

export { testData2 };
