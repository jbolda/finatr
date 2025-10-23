import type { AccountWithDinero } from '~/src/store/selectors/accounts.ts';
import {
  floatFromDinero,
  floatFromScaled
} from '~/src/store/utils/dineroUtils.ts';

export const navigateToAccountForm = (account: AccountWithDinero) => {
  return {
    state: {
      account: {
        id: account.id,
        name: account.name,
        starting: floatFromDinero(account.starting),
        interest: floatFromScaled(account.interest),
        vehicle: account.vehicle
      }
    }
  };
};
