import { takeLatest } from 'starfx';

function* watchTransactions() {
  const task = yield* takeLatest('transaction:add', function* (action) {
    console.log({ action });

    // const mod = nextModification(transaction.rtype);
    // console.log({
    //   transaction,
    //   seedDate: transaction.start,
    //   occurrences: transaction.occurrences
    // });
    // const { date, y } = mod({
    //   transaction,
    //   seedDate: transaction.start,
    //   occurrences: transaction.occurrences
    // });
    // console.log({ transaction, dailyRate, date, y });
  });
}

export const tasks = [watchTransactions];
