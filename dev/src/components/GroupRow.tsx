import { Icon, Tag } from '@blueprintjs/core';
import type { Group } from 'chemical-groups';
import { memo } from 'react';
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
  /** Position of the row in the virtualized list */
  dataIndex: number;
  /** Callback of the virtualizer, to measure the real height of the row */
  measureRef: (element: HTMLElement | null) => void;
}

/**
 * One row of the list of groups. Memoized because rendering the structure is
 * the expensive part of the list.
 */
export const GroupRow = memo(function GroupRow(props: GroupRowProps) {
  const { group, errors, color, selected, onSelect, dataIndex, measureRef } =
    props;
  return (
    <tr
      ref={measureRef}
      data-index={dataIndex}
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
        {group.ocl ? (
          <IdcodeSvgRenderer
            idcode={group.ocl.value}
            coordinates={group.ocl.coordinates}
            width={110}
            height={70}
            autoCrop
            autoCropMargin={2}
          />
        ) : null}
      </td>
      <td>
        {errors > 0 ? (
          <Icon icon="error" intent="danger" title={`${errors} errors`} />
        ) : null}
      </td>
    </tr>
  );
});
