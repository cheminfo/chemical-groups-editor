import type { Group } from './types.ts';

/**
 * Key order used when serializing an edited group, matching the order already
 * used in `groups.ts` so that the diff stays minimal.
 */
export const GROUP_KEYS = [
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
] as const satisfies ReadonlyArray<keyof Group>;

/** Type-level assertion that `T` is empty. */
type Never<T extends never> = T;

/**
 * Fails to compile when a field of `Group` is missing from `GROUP_KEYS`, which
 * would silently drop that field from every group the editor rewrites.
 */
export type UnlistedGroupKey = Never<
  Exclude<keyof Group, (typeof GROUP_KEYS)[number]>
>;
