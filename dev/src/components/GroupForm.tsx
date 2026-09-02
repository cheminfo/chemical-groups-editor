import { FormGroup, InputGroup } from '@blueprintjs/core';
import type { Group } from 'chemical-groups';

interface GroupFormProps {
  group: Group;
  onChange: (changes: Partial<Group>) => void;
}

const FIELDS: Array<{ key: keyof Group; label: string; placeholder?: string }> =
  [
    { key: 'symbol', label: 'Symbol' },
    { key: 'name', label: 'Name' },
    { key: 'mf', label: 'Molecular formula', placeholder: 'C3H6NO' },
    { key: 'kind', label: 'Kind', placeholder: 'aa, DNA, RNA, …' },
    { key: 'oneLetter', label: 'One letter' },
    { key: 'alternativeOneLetter', label: 'Alternative one letter' },
  ];

/**
 * Editable text fields of a group. The derived fields (mass, elements, …) are
 * recomputed from the formula and are shown read-only elsewhere.
 * @param props - Group to edit and the callback receiving the changed fields.
 * @returns One labelled text field per editable property of the group.
 */
export function GroupForm(props: GroupFormProps) {
  const { group, onChange } = props;
  return (
    <div className="group-form">
      {FIELDS.map(({ key, label, placeholder }) => (
        <FormGroup key={key} label={label}>
          <InputGroup
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder}
            value={(group[key] as string | undefined) ?? ''}
            onValueChange={(value) => onChange({ [key]: value })}
          />
        </FormGroup>
      ))}
    </div>
  );
}
