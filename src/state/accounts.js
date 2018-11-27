import { valueOf, StringType, BooleanType } from 'microstates';
import { Big } from './customTypes.js';

class Account {
  account = StringType;
  starting = Big;
  interest = Big;
  vehicle = StringType;

  get state() {
    return valueOf(this);
  }
}

class AccountComputed extends Account {
  visible = BooleanType;
}

export { Account, AccountComputed };
