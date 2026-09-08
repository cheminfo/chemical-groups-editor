import { Button } from '@blueprintjs/core';
import { useMemo } from 'react';

import type { Group } from '../types.ts';

import { countByKind, kindColor } from './kinds.ts';

interface KindFilterProps {
  groups: Group[];
  /** Selected kind, `null` means all of them */
  selected: string | null;
  onChange: (kind: string | null) => void;
}

/**
 * Radio buttons to filter the groups by kind (`aa`, `DNA`, `RNA`, …), each kind
 * having its own color. Only one kind at a time; clicking the selected one goes
 * back to all of them.
 * @param props - Groups to count, the selected kind and the change callback.
 * @returns The row of kind buttons, preceded by an "all" button.
 */
export function KindFilter(props: KindFilterProps) {
  const { groups, selected, onChange } = props;
  const counts = useMemo(() => countByKind(groups), [groups]);

  return (
    <div className="kind-filter">
      <Button
        size="small"
        active={selected === null}
        text={`all (${groups.length})`}
        onClick={() => onChange(null)}
      />
      {counts.map(([kind, count], index) => {
        const color = kindColor(kind, index);
        const active = selected === kind;
        return (
          <Button
            key={kind}
            size="small"
            active={active}
            text={`${kind} (${count})`}
            style={
              active
                ? { background: color, color: '#fff' }
                : { color, boxShadow: `inset 0 0 0 1px ${color}` }
            }
            onClick={() => onChange(active ? null : kind)}
          />
        );
      })}
    </div>
  );
}
