import { Alert, Button, Callout, Spinner } from '@blueprintjs/core';
import { useMemo, useState } from 'react';

import { createGroup } from '../chemistry/groupInfo.ts';
import { getDuplicateSymbols } from '../chemistry/validate.ts';
import { GroupDetail } from '../components/GroupDetail.tsx';
import { GroupList } from '../components/GroupList.tsx';
import { GroupsToolbar } from '../components/GroupsToolbar.tsx';
import type { GroupsFileState } from '../hooks/useGroupsFile.ts';
import type { Group } from '../types.ts';

interface GroupsPageProps {
  file: GroupsFileState;
}

/**
 * Browse and edit `groups.ts`.
 * @param props - Holds the groups file to read and write.
 * @returns The group list next to the editor of the selected group.
 */
export function GroupsPage(props: GroupsPageProps) {
  const { file } = props;
  const { status, error, message, path, saved, groups, setGroups } = file;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<string | null>(null);
  const [onlyIssues, setOnlyIssues] = useState(false);
  const [onlyToVerify, setOnlyToVerify] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const duplicates = useMemo(() => getDuplicateSymbols(groups), [groups]);
  const selected = groups[selectedIndex];

  function replaceSelected(group: Group) {
    const next = groups.slice();
    next[selectedIndex] = group;
    setGroups(next);
  }

  function duplicateSelected() {
    if (!selected) return;
    const next = groups.slice();
    next.splice(selectedIndex + 1, 0, {
      ...selected,
      symbol: `${selected.symbol}Copy`,
    });
    setGroups(next);
    setSelectedIndex(selectedIndex + 1);
  }

  function deleteSelected() {
    const next = groups.slice();
    next.splice(selectedIndex, 1);
    setGroups(next);
    setSelectedIndex(Math.min(selectedIndex, next.length - 1));
    setDeleting(false);
  }

  function addGroup() {
    const next = [...groups, createGroup(`New${groups.length}`)];
    setGroups(next);
    setSelectedIndex(next.length - 1);
  }

  if (status === 'loading') return <Spinner />;

  return (
    <div className="page">
      <GroupsToolbar file={file}>
        <Button icon="add" text="New group" onClick={addGroup} />
      </GroupsToolbar>

      {error ? <Callout intent="danger">{error}</Callout> : null}
      {message ? <Callout intent="success">{message}</Callout> : null}

      <div className="groups-layout">
        <GroupList
          groups={groups}
          duplicates={duplicates}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          search={search}
          onSearchChange={setSearch}
          kind={kind}
          onKindChange={setKind}
          onlyIssues={onlyIssues}
          onOnlyIssuesChange={setOnlyIssues}
          onlyToVerify={onlyToVerify}
          onOnlyToVerifyChange={setOnlyToVerify}
        />
        {selected ? (
          <GroupDetail
            group={selected}
            duplicates={duplicates}
            editorKey={`${selectedIndex}-${path}-${saved.length}`}
            onChange={replaceSelected}
            onDuplicate={duplicateSelected}
            onDelete={() => setDeleting(true)}
          />
        ) : null}
      </div>

      <Alert
        isOpen={deleting}
        intent="danger"
        icon="trash"
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        onCancel={() => setDeleting(false)}
        onConfirm={deleteSelected}
      >
        Delete the group {selected?.symbol}? The file is only modified when you
        save.
      </Alert>
    </div>
  );
}
