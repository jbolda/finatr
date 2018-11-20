import isWithinInterval from 'date-fns/fp/isWithinInterval';

describe(`testing interval functions`, () => {
  const testInterval = {
    start: new Date(2018, 2, 3),
    end: new Date(2018, 2, 7)
  };
  const testWithin = isWithinInterval(testInterval);

  it(`falls directly within intervals`, () => {
    expect(testWithin(new Date(2018, 2, 4))).toBe(true);
  });

  it(`falls outside intervals`, () => {
    expect(testWithin(new Date(2018, 2, 2))).toBe(false);
  });

  it(`falls directly on start of interval`, () => {
    expect(testWithin(new Date(2018, 2, 3))).toBe(true);
  });

  it(`falls directly on end of interval`, () => {
    expect(testWithin(new Date(2018, 2, 7))).toBe(true);
  });
});
