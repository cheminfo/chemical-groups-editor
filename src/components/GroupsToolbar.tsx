import { Button, Tag } from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import { getDuplicateSymbols, getIssues } from '../chemistry/validate.ts';
import type { GroupsFileState } from '../hooks/useGroupsFile.ts';

interface GroupsToolbarProps {
  file: GroupsFileState;
  /** Buttons specific to the current page */
  children?: ReactNode;
}

/**
 * Save / reload bar shared by the pages that edit `groups.ts`.
 * @param props - State of the groups file and the buttons of the current page.
 * @returns The save and reload buttons, the counters and the path of the file.
 */
export function GroupsToolbar(props: GroupsToolbarProps) {
  const { file, children } = props;
  const errorCount = useMemo(() => {
    const duplicates = getDuplicateSymbols(file.groups);
    let count = 0;
    for (const group of file.groups) {
      if (
        getIssues(group, duplicates).some((issue) => issue.level === 'error')
      ) {
        count++;
      }
    }
    return count;
  }, [file.groups]);

  return (
    <div className="toolbar">
      <Button
        icon="floppy-disk"
        intent="primary"
        text="Save to groups.ts"
        disabled={!file.isDirty}
        loading={file.saving}
        onClick={() => void file.save(file.groups)}
      />
      <Button
        icon="refresh"
        text="Reload from file"
        onClick={() => void file.reload()}
      />
      {children}
      <Tag minimal>{file.groups.length} groups</Tag>
      <Tag minimal intent={errorCount > 0 ? 'danger' : 'success'}>
        {errorCount} with errors
      </Tag>
      {file.isDirty ? <Tag intent="warning">unsaved changes</Tag> : null}
      <span className="file-path">{file.path}</span>
    </div>
  );
}
