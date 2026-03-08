import { LoroDoc } from 'loro-crdt';
import { createContext } from 'starfx';

export const RootDoc = createContext('starfx:loro', new LoroDoc());
