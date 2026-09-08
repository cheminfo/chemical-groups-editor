import { Button, Callout, Card, Tag } from '@blueprintjs/core';
import { useState } from 'react';
import { CanvasMoleculeEditor } from 'react-ocl';

import { oclFromIdcode } from '../chemistry/structure.ts';
import type { Group, GroupOcl } from '../types.ts';

import { MfDisplay } from './MfDisplay.tsx';

interface GroupStructureProps {
  group: Group;
  /** Formula computed from the current structure, R atoms excluded */
  mfFromStructure: string | null;
  /** Whether that formula and the `mf` field describe the same molecule */
  mfMatches: boolean;
  rAtoms: number;
  onChange: (ocl: GroupOcl) => void;
  onUseStructureMf: () => void;
}

/**
 * Structure editor of the selected group. The editor is uncontrolled: it is
 * initialized once and remounted by its `key` when another group is selected,
 * so that drawing never resets the coordinates.
 * @param props - Group to draw, the formula computed from its structure and the callbacks.
 * @returns The card holding the editor, the formula comparison and the R atom count.
 */
export function GroupStructure(props: GroupStructureProps) {
  const {
    group,
    mfFromStructure,
    mfMatches,
    rAtoms,
    onChange,
    onUseStructureMf,
  } = props;
  const [inputValue] = useState(() => toEditorValue(group.ocl));

  return (
    <Card className="structure-card">
      <div className="structure-hint">
        Attachment points are normal atoms: hover an atom and type{' '}
        <code>R</code>, <code>R1</code>, <code>R2</code> or <code>R3</code>.
      </div>
      <div className="structure-editor">
        <CanvasMoleculeEditor
          inputFormat="idcode"
          inputValue={inputValue}
          height={340}
          onChange={(event) => onChange(oclFromIdcode(event.getIdcode()))}
        />
      </div>
      <div className="structure-info">
        <Callout
          compact
          intent={mfMatches ? 'success' : 'danger'}
          icon={mfMatches ? 'tick-circle' : 'error'}
        >
          <div>
            From structure:{' '}
            {mfFromStructure ? <MfDisplay mf={mfFromStructure} /> : '—'}
          </div>
          <div>
            Expected (mf field): <MfDisplay mf={group.mf} />
          </div>
        </Callout>
        <Tag
          minimal
          intent={rAtoms === 0 ? 'warning' : 'none'}
          title="R atoms are real openchemlib atoms: hover an atom in the editor and type R, R1, R2 or R3 to turn it into an attachment point"
        >
          {rAtoms} R atom{rAtoms === 1 ? '' : 's'}
        </Tag>
        <Button
          disabled={!mfFromStructure || mfMatches}
          icon="arrow-up"
          text="Use the formula of the structure"
          onClick={onUseStructureMf}
        />
      </div>
    </Card>
  );
}

function toEditorValue(ocl: GroupOcl | undefined): string {
  if (!ocl?.value) return '';
  return ocl.coordinates ? `${ocl.value} ${ocl.coordinates}` : ocl.value;
}
