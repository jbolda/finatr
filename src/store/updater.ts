import { LoroMap } from 'loro-crdt';
import { type AnyState } from 'starfx';

export const buildDocSubtree = ({
  initial,
  parent
}: {
  initial: AnyState;
  parent: LoroMap;
}) => {
  for (let [key, value] of Object.entries(initial)) {
    if (Object.keys(value).length !== 0) {
      parent.set(key, value);
    } else if (['accounts', 'transactions'].includes(key)) {
      parent.setContainer(key, new LoroMap());
    }
  }
};
