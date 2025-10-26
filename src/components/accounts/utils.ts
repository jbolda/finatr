import type { Account } from '~/store/schema';
import { floatFromDinero, floatFromScaled } from '~/store/utils/dineroUtils.ts';

export const navigateToAccountForm = (account: Account) => {
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
