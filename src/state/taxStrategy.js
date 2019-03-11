import { valueOf, StringType } from 'microstates';
import { Big } from './customTypes.js';

class Income {
  id = StringType;
  group = StringType;
  gross = Big;
  federal = Big;
  state = Big;
  socialSecurity = Big;
  hsa = Big;
  pretaxInvestments = Big;
}

class TaxStrategy {
  incomeReceived = [Income];

  get state() {
    return valueOf(this);
  }
}

export { TaxStrategy };
