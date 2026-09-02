import type { Group } from 'chemical-groups';

/** Value used for the groups that have no `kind` */
export const NO_KIND = '—';

/** Blueprint palette, one color per kind, in the order the kinds are listed */
const COLORS = [
  '#2d72d2',
  '#1c6e42',
  '#935610',
  '#ac2f33',
  '#8c4fa3',
  '#007067',
  '#946638',
  '#5642a6',
  '#c22762',
  '#2f6b7e',
  '#63411e',
  '#4c90f0',
];

/**
 * Whether a group passes the kind filter.
 * @param group - Group to test.
 * @param kinds - Selected kinds, empty means all of them.
 * @returns `true` when the kind of the group is selected.
 */
export function matchesKind(group: Group, kinds: Set<string>): boolean {
  if (kinds.size === 0) return true;
  return kinds.has(group.kind ?? NO_KIND);
}

/**
 * Color of a kind, used by the filter and by the tag of the list.
 * @param kind - Kind of the group, or `NO_KIND`.
 * @param index - Position of the kind in the list of kinds.
 * @returns The hexadecimal color of the kind, grey for `NO_KIND`.
 */
export function kindColor(kind: string, index: number): string {
  if (kind === NO_KIND) return '#5f6b7c';
  return COLORS[index % COLORS.length] as string;
}

/**
 * Kinds present in the groups, sorted, with the number of groups of each kind.
 * @param groups - Groups to count.
 * @returns The `[kind, count]` pairs, sorted by kind.
 */
export function countByKind(groups: Group[]): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const group of groups) {
    const kind = group.kind ?? NO_KIND;
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  return [...counts].toSorted((a, b) => a[0].localeCompare(b[0]));
}
