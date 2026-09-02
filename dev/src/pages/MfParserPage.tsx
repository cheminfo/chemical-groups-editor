import { Callout, Card, H4, HTMLTable, InputGroup } from '@blueprintjs/core';
import { MF } from 'mf-parser';
import { useMemo, useState } from 'react';

import { MfDisplay } from '../components/MfDisplay.tsx';

/**
 * Playground for `mf-parser`: parse a molecular formula, including group
 * symbols like `Ala` coming from `chemical-groups`.
 * @returns The formula input, its parsed info and its elemental analysis.
 */
export function MfParserPage() {
  const [mf, setMf] = useState('HOAlaGlyOH');
  const parsed = useMemo(() => parse(mf), [mf]);

  return (
    <div className="page">
      <InputGroup
        size="large"
        autoComplete="off"
        spellCheck={false}
        leftIcon="function"
        placeholder="C6H12O6, HOAlaGlyOH, C10H20Cl2Na+, …"
        value={mf}
        onValueChange={setMf}
      />
      {'error' in parsed ? (
        <Callout intent="danger">{parsed.error}</Callout>
      ) : (
        <div className="mf-results">
          <Card>
            <H4>Info</H4>
            <div className="mf-html">
              <MfDisplay mf={mf} />
            </div>
            <HTMLTable compact>
              <tbody>
                {Object.entries(parsed.info).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>
                      {typeof value === 'object'
                        ? JSON.stringify(value)
                        : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </HTMLTable>
          </Card>
          <Card>
            <H4>Elemental analysis</H4>
            <HTMLTable compact>
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Mass</th>
                  <th>Ratio</th>
                </tr>
              </thead>
              <tbody>
                {parsed.ea.map((entry) => (
                  <tr key={entry.element}>
                    <td>{entry.element}</td>
                    <td>{entry.mass.toFixed(4)}</td>
                    <td>{(entry.ratio * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </HTMLTable>
          </Card>
        </div>
      )}
    </div>
  );
}

function parse(mf: string) {
  if (!mf) return { error: 'enter a molecular formula' };
  try {
    const parsed = new MF(mf);
    const { atoms, ...info } = parsed.getInfo();
    return {
      info: { ...info, atoms: JSON.stringify(atoms) },
      ea: parsed.getEA(),
    };
  } catch (error) {
    return { error: String(error) };
  }
}
