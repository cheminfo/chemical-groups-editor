import { groups } from './groups.ts';
import type { Group } from './types.ts';

/**
 * The groups indexed by their symbol. Symbols are unique, which is asserted by
 * the tests of this package and by the `npm run dev` editor.
 */
export const groupsObject: Record<string, Group> = {};

for (const group of groups) {
  groupsObject[group.symbol] = group;
}
