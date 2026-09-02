import type { Group } from 'chemical-groups';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchGroups, saveGroups } from '../api/groupsApi.ts';

interface State {
  status: 'loading' | 'ready' | 'error';
  path: string;
  groups: Group[];
  /** Last content read from or written to the file, to detect changes */
  saved: Group[];
  error: string | null;
  message: string | null;
  saving: boolean;
}

const initialState: State = {
  status: 'loading',
  path: '',
  groups: [],
  saved: [],
  error: null,
  message: null,
  saving: false,
};

/**
 * Load `groups.ts` from the dev webservice, keep the edited version in memory
 * and write it back on demand.
 * @returns The load status, the edited groups, whether they differ from the
 * file, and the `setGroups`, `reload` and `save` actions.
 */
export function useGroupsFile() {
  const [state, setState] = useState<State>(initialState);

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: null }));
    try {
      const { path, groups } = await fetchGroups();
      setState({
        ...initialState,
        status: 'ready',
        path,
        groups,
        saved: groups,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        status: 'error',
        error: String(error),
      }));
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setGroups = useCallback((groups: Group[]) => {
    setState((current) => ({ ...current, groups, message: null }));
  }, []);

  const save = useCallback(async (groups: Group[]) => {
    setState((current) => ({ ...current, saving: true, error: null }));
    try {
      const count = await saveGroups(groups);
      setState((current) => ({
        ...current,
        saving: false,
        saved: groups,
        message: `${count} groups written`,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        saving: false,
        error: String(error),
      }));
    }
  }, []);

  const isDirty = useMemo(
    () => JSON.stringify(state.groups) !== JSON.stringify(state.saved),
    [state.groups, state.saved],
  );

  return { ...state, isDirty, setGroups, reload, save };
}

export type GroupsFileState = ReturnType<typeof useGroupsFile>;
