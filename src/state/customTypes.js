import { valueOf } from 'microstates';
import { default as _Big } from 'big.js';
import { Primitive } from 'microstates';

class Big extends Primitive {
  initialize(value = 0) {
    return value instanceof _Big ? value : _Big(value);
  }

  add(value) {
    return this.state.add(value);
  }

  div(value) {
    return this.state.div(value);
  }

  eq(value) {
    return this.state.eq(value);
  }

  get state() {
    return valueOf(this);
  }

  get toFixed() {
    return this.state.toFixed(2);
  }

  get toNumber() {
    return Number(this.state);
  }
}

export { Big };
