import { createSchema, slice } from 'starfx/store';

const defaultSettings = {
  planning: true,
  import: false,
  examples: false,
  flow: false,
  accounts: false,
  taxes: false
};

const [schema, initialState] = createSchema({
  settings: slice.obj(defaultSettings)
});

export { schema, initialState };
