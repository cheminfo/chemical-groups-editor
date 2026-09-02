import {
  Button,
  ButtonGroup,
  Callout,
  Card,
  Collapse,
  H4,
  HTMLTable,
} from '@blueprintjs/core';
import type { Group } from 'chemical-groups';
import { useState } from 'react';

import { updateGroup } from '../chemistry/groupInfo.ts';
import { analyzeGroup, getIssues } from '../chemistry/validate.ts';

import { GroupForm } from './GroupForm.tsx';
import { GroupStructure } from './GroupStructure.tsx';
import { JsonEditor } from './JsonEditor.tsx';

interface GroupDetailProps {
  group: Group;
  duplicates: Set<string>;
  /** Changes when another group is selected, to remount the structure editor */
  editorKey: string;
  onChange: (group: Group) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

/**
 * Edition panel of the selected group: fields, structure and computed values.
 * @param props - Group to edit, its duplicates and the edition callbacks.
 * @returns The header, the issues, the form, the structure editor and the computed values.
 */
export function GroupDetail(props: GroupDetailProps) {
  const { group, duplicates, editorKey, onChange, onDuplicate, onDelete } =
    props;
  const { mfFromStructure, mfMatches, rAtoms } = analyzeGroup(group);
  const issues = getIssues(group, duplicates);
  const [showJson, setShowJson] = useState(false);

  return (
    <div className="group-detail">
      <div className="group-detail-header">
        <H4>
          {group.symbol} — {group.name}
        </H4>
        <ButtonGroup>
          {group.toVerify ? (
            <Button
              icon="confirm"
              intent="warning"
              text="Mark as checked"
              onClick={() => onChange(updateGroup(group, { toVerify: false }))}
            />
          ) : null}
          <Button icon="duplicate" text="Duplicate" onClick={onDuplicate} />
          <Button
            icon="trash"
            intent="danger"
            text="Delete"
            onClick={onDelete}
          />
        </ButtonGroup>
      </div>

      {issues.length > 0 ? (
        <Callout
          compact
          intent={
            issues.some((issue) => issue.level === 'error')
              ? 'danger'
              : 'warning'
          }
        >
          <ul className="issue-list">
            {issues.map((issue) => (
              <li key={issue.message}>{issue.message}</li>
            ))}
          </ul>
        </Callout>
      ) : null}

      <div className="group-detail-columns">
        <GroupForm
          group={group}
          onChange={(changes) => onChange(updateGroup(group, changes))}
        />
        <GroupStructure
          key={editorKey}
          group={group}
          mfFromStructure={mfFromStructure}
          mfMatches={mfMatches}
          rAtoms={rAtoms}
          onChange={(ocl) => onChange(updateGroup(group, { ocl }))}
          onUseStructureMf={() => {
            if (mfFromStructure) {
              onChange(updateGroup(group, { mf: mfFromStructure }));
            }
          }}
        />
      </div>

      <Card compact>
        <HTMLTable compact className="computed-table">
          <tbody>
            <tr>
              <td>Mass</td>
              <td>{group.mass}</td>
            </tr>
            <tr>
              <td>Monoisotopic mass</td>
              <td>{group.monoisotopicMass}</td>
            </tr>
            <tr>
              <td>Unsaturation</td>
              <td>{String(group.unsaturation)}</td>
            </tr>
            <tr>
              <td>Elements</td>
              <td>
                {group.elements
                  ?.map(
                    (element) =>
                      `${element.isotope ? `[${element.isotope}]` : ''}${element.symbol}${element.number}`,
                  )
                  .join(' ')}
              </td>
            </tr>
          </tbody>
        </HTMLTable>
      </Card>

      <div>
        <Button
          variant="minimal"
          icon={showJson ? 'chevron-down' : 'chevron-right'}
          text="JSON of this group"
          onClick={() => setShowJson(!showJson)}
        />
        <Collapse isOpen={showJson}>
          <JsonEditor readOnly value={JSON.stringify(group, null, 2)} />
        </Collapse>
      </div>
    </div>
  );
}
