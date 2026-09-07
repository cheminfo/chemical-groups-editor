import { Icon, Tag } from '@blueprintjs/core';
import type { Group } from 'chemical-groups';
import type { RefObject } from 'react';
import { memo, useEffect, useRef, useState } from 'react';
import { IdcodeSvgRenderer } from 'react-ocl';

import { MfDisplay } from './MfDisplay.tsx';

interface GroupRowProps {
  group: Group;
  /** Number of errors of the group, shown as an icon */
  errors: number;
  /** Color of the kind of the group */
  color: string | undefined;
  selected: boolean;
  onSelect: () => void;
  /** Scrolling container of the list, root of the visibility observer */
  scrollRef: RefObject<HTMLElement | null>;
}

/**
 * One row of the list of groups. Memoized because rendering the structure is
 * the expensive part of the list.
 */
export const GroupRow = memo(function GroupRow(props: GroupRowProps) {
  const { group, errors, color, selected, onSelect, scrollRef } = props;
  const rowRef = useRef<HTMLTableRowElement>(null);
  const drawStructure = useHasBeenVisible(rowRef, scrollRef);

  useEffect(() => {
    if (selected) rowRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  return (
    <tr
      ref={rowRef}
      className={selected ? 'selected-row' : undefined}
      onClick={onSelect}
    >
      <td>
        <b>{group.symbol}</b>
        {group.kind ? (
          <Tag minimal style={{ background: color, color: '#fff' }}>
            {group.kind}
          </Tag>
        ) : null}
        {group.toVerify ? (
          <Icon icon="issue" intent="warning" title="structure to check" />
        ) : null}
      </td>
      <td>{group.name}</td>
      <td>
        <MfDisplay mf={group.mf} />
      </td>
      <td>
        <div className="structure-cell">
          {group.ocl && drawStructure ? (
            <IdcodeSvgRenderer
              idcode={group.ocl.value}
              coordinates={group.ocl.coordinates}
              width={110}
              height={70}
              autoCrop
              autoCropMargin={2}
            />
          ) : null}
        </div>
      </td>
      <td>
        {errors > 0 ? (
          <Icon icon="error" intent="danger" title={`${errors} errors`} />
        ) : null}
      </td>
    </tr>
  );
});

/**
 * Whether the row has been scrolled into view at least once. Drawing the 300
 * structures at once takes seconds, so a row only draws its own once it is
 * reached, and keeps it afterwards so that scrolling back is instant.
 * @param rowRef - Reference to the row to watch.
 * @param scrollRef - Reference to the scrolling container. It has to be the
 * root of the observer: a margin around the viewport would be cancelled by the
 * container clipping the rows it scrolls.
 * @returns `true` once the row has come close to the visible part of the list.
 */
function useHasBeenVisible(
  rowRef: RefObject<HTMLElement | null>,
  scrollRef: RefObject<HTMLElement | null>,
): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const row = rowRef.current;
    if (!row || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setVisible(true);
      },
      { root: scrollRef.current, rootMargin: '300px' },
    );
    observer.observe(row);
    return () => observer.disconnect();
  }, [rowRef, scrollRef, visible]);

  return visible;
}
