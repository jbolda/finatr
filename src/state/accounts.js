import { valueOf, StringType } from 'microstates';
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

export { Account };
