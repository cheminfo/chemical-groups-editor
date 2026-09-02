import { Button } from '@blueprintjs/core';
import type { Group } from 'chemical-groups';
import { useMemo } from 'react';

import { countByKind, kindColor } from './kinds.ts';

interface KindFilterProps {
  groups: Group[];
  /** Selected kinds, empty means all of them */
  kinds: Set<string>;
  onChange: (kinds: Set<string>) => void;
}

/**
 * Toggle buttons to filter the groups by kind (`aa`, `DNA`, `RNA`, …), each
 * kind having its own color.
 * @param props - Groups to count, the selected kinds and the change callback.
 * @returns The row of kind buttons, preceded by an "all" button.
 */
export function KindFilter(props: KindFilterProps) {
  const { groups, kinds, onChange } = props;
  const counts = useMemo(() => countByKind(groups), [groups]);

  function toggle(kind: string) {
    const next = new Set(kinds);
    if (next.has(kind)) {
      next.delete(kind);
    } else {
      next.add(kind);
    }
    onChange(next);
  }

  return (
    <div className="kind-filter">
      <Button
        size="small"
        active={kinds.size === 0}
        text={`all (${groups.length})`}
        onClick={() => onChange(new Set())}
      />
      {counts.map(([kind, count], index) => {
        const color = kindColor(kind, index);
        const active = kinds.has(kind);
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
            onClick={() => toggle(kind)}
          />
        );
      })}
    </div>
  );
}
