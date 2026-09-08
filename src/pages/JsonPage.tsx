import { Button, Callout, InputGroup, Spinner } from '@blueprintjs/core';
import { useMemo, useState } from 'react';

import { GroupsToolbar } from '../components/GroupsToolbar.tsx';
import { JsonEditor } from '../components/JsonEditor.tsx';
import type { GroupsFileState } from '../hooks/useGroupsFile.ts';
import type { Group } from '../types.ts';

interface JsonPageProps {
  file: GroupsFileState;
}

/**
 * Raw JSON of `groups.ts`, with colors and foldable groups. Editing it here and
 * applying the changes replaces the groups of the other pages.
 * @param props - Holds the groups file to read and write.
 * @returns The toolbar, the symbol filter and the JSON editor.
 */
export function JsonPage(props: JsonPageProps) {
  const { file } = props;
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterGroups(file.groups, search),
    [file.groups, search],
  );
  const text = useMemo(() => JSON.stringify(filtered, null, 2), [filtered]);
  const editable = search === '';

  function apply() {
    if (draft === null) return;
    try {
      const parsed: unknown = JSON.parse(draft);
      if (!Array.isArray(parsed)) throw new Error('the JSON must be an array');
      file.setGroups(parsed as Group[]);
      setDraft(null);
      setError(null);
    } catch (parseError) {
      setError(String(parseError));
    }
  }

  if (file.status === 'loading') return <Spinner />;

  return (
    <div className="page">
      <GroupsToolbar file={file}>
        <Button
          icon="tick"
          text="Apply changes"
          disabled={draft === null}
          onClick={apply}
        />
        <Button
          icon="undo"
          text="Revert"
          disabled={draft === null}
          onClick={() => {
            setDraft(null);
            setError(null);
          }}
        />
      </GroupsToolbar>

      <div className="json-filter">
        <InputGroup
          leftIcon="search"
          placeholder="filter by symbol, name or formula"
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            setDraft(null);
          }}
        />
        {editable ? null : (
          <span className="file-path">
            filtered view, read-only — clear the filter to edit
          </span>
        )}
      </div>

      {error ? <Callout intent="danger">{error}</Callout> : null}

      <div className="json-editor">
        <JsonEditor
          value={draft ?? text}
          readOnly={!editable}
          onChange={editable ? setDraft : undefined}
        />
      </div>
    </div>
  );
}

function filterGroups(groups: Group[], search: string): Group[] {
  if (!search) return groups;
  const lowerCaseSearch = search.toLowerCase();
  return groups.filter(
    (group) =>
      group.symbol.toLowerCase().includes(lowerCaseSearch) ||
      group.name.toLowerCase().includes(lowerCaseSearch) ||
      group.mf.toLowerCase().includes(lowerCaseSearch),
  );
}
