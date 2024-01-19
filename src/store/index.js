import { createSchema, slice } from 'starfx/store';

const defaultSettings = {
  planning: true,
  import: false,
  examples: false,
  flow: false,
  accounts: false,
  taxes: false
};

export const schema = createSchema({
  settings: slice.obj(defaultSettings)
});

export const db = schema.db;
