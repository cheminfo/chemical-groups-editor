import { Button, HTMLTable, InputGroup, Switch, Tag } from '@blueprintjs/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Group } from 'chemical-groups';
import { useEffect, useMemo, useRef } from 'react';

import { getIssues } from '../chemistry/validate.ts';

import { GroupRow } from './GroupRow.tsx';
import { KindFilter } from './KindFilter.tsx';
import { countByKind, kindColor, matchesKind } from './kinds.ts';

/** Height of a row, structure included, before it is measured */
const ROW_HEIGHT = 82;

interface GroupListProps {
  groups: Group[];
  duplicates: Set<string>;
  selectedIndex: number;
  onSelect: (index: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  kinds: Set<string>;
  onKindsChange: (kinds: Set<string>) => void;
  onlyIssues: boolean;
  onOnlyIssuesChange: (onlyIssues: boolean) => void;
  onlyToVerify: boolean;
  onOnlyToVerifyChange: (onlyToVerify: boolean) => void;
}

/**
 * Filterable table of all the groups of `groups.ts`. Only the visible rows are
 * rendered: drawing the 300 structures at once takes seconds.
 * @param props - Groups to list, the current filters and the selection callbacks.
 * @returns The kind filter, the search filters and the virtualized table.
 */
export function GroupList(props: GroupListProps) {
  const {
    groups,
    duplicates,
    selectedIndex,
    onSelect,
    search,
    onSearchChange,
    kinds,
    onKindsChange,
    onlyIssues,
    onOnlyIssuesChange,
    onlyToVerify,
    onOnlyToVerifyChange,
  } = props;

  const scrollRef = useRef<HTMLDivElement>(null);

  const toVerifyCount = useMemo(
    () => groups.filter((group) => group.toVerify).length,
    [groups],
  );

  const colors = useMemo(() => {
    const map = new Map<string, string>();
    for (const [index, [kind]] of countByKind(groups).entries()) {
      map.set(kind, kindColor(kind, index));
    }
    return map;
  }, [groups]);

  const rows = useMemo(() => {
    const lowerCaseSearch = search.toLowerCase();
    const result: Array<{ group: Group; index: number; errors: number }> = [];
    for (let index = 0; index < groups.length; index++) {
      const group = groups[index] as Group;
      if (lowerCaseSearch && !matches(group, lowerCaseSearch)) continue;
      if (!matchesKind(group, kinds)) continue;
      if (onlyToVerify && !group.toVerify) continue;
      const errors = getIssues(group, duplicates).filter(
        (issue) => issue.level === 'error',
      ).length;
      if (onlyIssues && errors === 0) continue;
      result.push({ group, index, errors });
    }
    return result;
  }, [groups, duplicates, search, kinds, onlyIssues, onlyToVerify]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 6,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const paddingTop = virtualRows[0]?.start ?? 0;
  const paddingBottom =
    virtualizer.getTotalSize() - (virtualRows.at(-1)?.end ?? 0);

  useKeyboardNavigation(rows, selectedIndex, onSelect);

  const position = rows.findIndex((row) => row.index === selectedIndex);
  useEffect(() => {
    if (position !== -1) virtualizer.scrollToIndex(position);
  }, [position, virtualizer]);

  return (
    <div className="group-list">
      <KindFilter groups={groups} kinds={kinds} onChange={onKindsChange} />
      <div className="group-list-filters">
        <InputGroup
          fill
          leftIcon="search"
          placeholder="symbol, name or formula"
          value={search}
          onValueChange={onSearchChange}
        />
        <Switch
          checked={onlyIssues}
          label="Only errors"
          onChange={(event) => onOnlyIssuesChange(event.currentTarget.checked)}
        />
        <Button
          size="small"
          icon="issue"
          intent="warning"
          active={onlyToVerify}
          text={`to check (${toVerifyCount})`}
          onClick={() => onOnlyToVerifyChange(!onlyToVerify)}
        />
        <Tag minimal>{rows.length}</Tag>
      </div>
      <div className="group-list-scroll" ref={scrollRef}>
        <HTMLTable compact interactive striped>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>MF</th>
              <th>Structure</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {paddingTop > 0 ? <tr style={{ height: paddingTop }} /> : null}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              if (!row) return null;
              return (
                <GroupRow
                  key={row.index}
                  group={row.group}
                  errors={row.errors}
                  color={
                    row.group.kind ? colors.get(row.group.kind) : undefined
                  }
                  selected={row.index === selectedIndex}
                  onSelect={() => onSelect(row.index)}
                  dataIndex={virtualRow.index}
                  measureRef={virtualizer.measureElement}
                />
              );
            })}
            {paddingBottom > 0 ? (
              <tr style={{ height: paddingBottom }} />
            ) : null}
          </tbody>
        </HTMLTable>
      </div>
    </div>
  );
}

/**
 * Move the selection with the up and down arrows, unless a field has the focus.
 * @param rows - Rows currently displayed, in their display order.
 * @param selectedIndex - Index in `groups` of the selected group.
 * @param onSelect - Called with the index in `groups` of the new selection.
 */
function useKeyboardNavigation(
  rows: Array<{ index: number }>,
  selectedIndex: number,
  onSelect: (index: number) => void,
) {
  const state = useRef({ rows, selectedIndex, onSelect });
  useEffect(() => {
    state.current = { rows, selectedIndex, onSelect };
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement
      ) {
        return;
      }
      const current = state.current;
      if (current.rows.length === 0) return;
      event.preventDefault();
      const position = current.rows.findIndex(
        (row) => row.index === current.selectedIndex,
      );
      const next =
        event.key === 'ArrowDown'
          ? Math.min(position + 1, current.rows.length - 1)
          : Math.max(position - 1, 0);
      const row = current.rows[next];
      if (row && row.index !== current.selectedIndex) {
        current.onSelect(row.index);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
}

function matches(group: Group, search: string): boolean {
  return (
    group.symbol.toLowerCase().includes(search) ||
    group.name.toLowerCase().includes(search) ||
    group.mf.toLowerCase().includes(search)
  );
}
