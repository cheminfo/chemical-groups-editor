import type { Group } from 'chemical-groups';

/**
 * Key order used when serializing an edited group, matching the order already
 * used in `src/groups.ts` so that the diff stays minimal.
 */
export const GROUP_KEYS: Array<keyof Group> = [
  'symbol',
  'name',
  'mf',
  'kind',
  'oneLetter',
  'alternativeOneLetter',
  'toVerify',
  'ocl',
  'mass',
  'monoisotopicMass',
  'unsaturation',
  'elements',
];
