export const defaultAccount = {
  name: 'account',
  starting: 0,
  interest: 0,
  vehicle: 'operating'
};
const emptyAccount = {
  name: '',
  starting: 0, // Big
  interest: 0, // Big
  vehicle: '',
  payback: []
};

export const defaultTransaction = {
  id: `seed-data-id`,
  raccount: `account`,
  description: `seed data`,
  category: `default transaction`,
  type: `income`,
  start: `2018-11-01`,
  rtype: `day`,
  cycle: 3,
  value: 150
};
export const emptyTransaction = {
  id: '0',
  raccount: '',
  description: '',
  category: '',
  type: '',
  start: '',
  end: '',
  rtype: '',
  cycle: 0,
  value: 0,
  occurrences: 0,
  beginAferOccurrences: 0
};
