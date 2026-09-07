import { FormGroup, HTMLSelect, InputGroup } from '@blueprintjs/core';
import type { Group, Kind } from 'chemical-groups';

import { KINDS } from './kinds.ts';

interface GroupFormProps {
  group: Group;
  onChange: (changes: Partial<Group>) => void;
}

interface Field {
  key: keyof Group;
  label: string;
  placeholder?: string;
}

/** Text fields shown before the kind selector */
const BEFORE_KIND: Field[] = [
  { key: 'symbol', label: 'Symbol' },
  { key: 'name', label: 'Name' },
  { key: 'mf', label: 'Molecular formula', placeholder: 'C3H6NO' },
];

/** Text fields shown after the kind selector */
const AFTER_KIND: Field[] = [
  { key: 'oneLetter', label: 'One letter' },
  { key: 'alternativeOneLetter', label: 'Alternative one letter' },
];

/**
 * Editable fields of a group. The kind is a selector rather than a text field:
 * the vocabulary is closed, and a typo used to create a new kind silently. The
 * derived fields (mass, elements, …) are recomputed from the formula and are
 * shown read-only elsewhere.
 * @param props - Group to edit and the callback receiving the changed fields.
 * @returns One labelled field per editable property of the group.
 */
export function GroupForm(props: GroupFormProps) {
  const { group, onChange } = props;
  return (
    <div className="group-form">
      {BEFORE_KIND.map((field) => renderText(field, group, onChange))}
      <FormGroup label="Kind">
        <HTMLSelect
          fill
          value={group.kind ?? ''}
          onChange={(event) => {
            const value = event.currentTarget.value;
            onChange({ kind: value === '' ? undefined : (value as Kind) });
          }}
        >
          <option value="">— none —</option>
          {KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </HTMLSelect>
      </FormGroup>
      {AFTER_KIND.map((field) => renderText(field, group, onChange))}
    </div>
  );
}

/**
 * One labelled text field bound to a property of the group.
 * @param field - Property to edit, its label and its placeholder.
 * @param group - Group being edited.
 * @param onChange - Callback receiving the changed field.
 * @returns The labelled input.
 */
function renderText(
  field: Field,
  group: Group,
  onChange: (changes: Partial<Group>) => void,
) {
  const { key, label, placeholder } = field;
  return (
    <FormGroup key={key} label={label}>
      <InputGroup
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        value={(group[key] as string | undefined) ?? ''}
        onValueChange={(value) => onChange({ [key]: value })}
      />
    </FormGroup>
  );
}
