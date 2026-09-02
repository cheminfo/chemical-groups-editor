import type { Group } from 'chemical-groups';

const API_URL = '/api/groups';

export interface GroupsFile {
  /** Absolute path of the edited `groups.ts` */
  path: string;
  /** Groups the file contains, in file order */
  groups: Group[];
}

/**
 * Read `src/groups.ts` through the dev webservice.
 * @returns The path of the file and the groups it contains.
 */
export async function fetchGroups(): Promise<GroupsFile> {
  const response = await fetch(API_URL);
  return handle<GroupsFile>(response);
}

/**
 * Overwrite `src/groups.ts` with the given groups.
 * @param groups - Complete list of groups to write.
 * @returns The number of groups written.
 */
export async function saveGroups(groups: Group[]): Promise<number> {
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ groups }),
  });
  const { count } = await handle<{ path: string; count: number }>(response);
  return count;
}

async function handle<T>(response: Response): Promise<T> {
  const body: unknown = await response.json();
  if (!response.ok) {
    const error = (body as { error?: string }).error;
    throw new Error(error ?? `${response.status} ${response.statusText}`);
  }
  return body as T;
}
