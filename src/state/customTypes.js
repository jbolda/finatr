import { default as _Big } from 'big.js';
import { create, Primitive, relationship } from 'microstates';

class Big extends Primitive {
  initialize(value = 0) {
    return value instanceof _Big ? value : _Big(value);
  }

  add(value) {
    return this.state.add(value);
  }

  minus(value) {
    return this.state.minus(value);
  }

  times(value) {
    return this.state.times(value);
  }

  div(value) {
    return this.state.div(value);
  }

  eq(value) {
    return this.state.eq(value);
  }

  average(value) {
    let next = this.state;
    if (next > 0) {
      return next.add(value).div(2);
    } else {
      return next.add(value);
    }
  }

  get toFixed() {
    return this.state.toFixed(2);
  }

  get toNumber() {
    return Number(this.state);
  }
}

const defaults = (Type, defaultValue) => {
  return relationship((parent, value) =>
    create(Type, value == null ? defaultValue : value)
  );
};

export { Big, _Big, defaults };
