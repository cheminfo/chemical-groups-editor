import { memo } from 'react';
import { MF } from 'react-mf';

import { isValidMf } from '../chemistry/groupInfo.ts';

interface MfDisplayProps {
  mf: string;
}

/**
 * Render a molecular formula with `react-mf`, falling back to the raw text when
 * the formula cannot be parsed, which happens while it is being typed.
 */
export const MfDisplay = memo(function MfDisplay(props: MfDisplayProps) {
  const { mf } = props;
  if (!mf) return null;
  if (!isValidMf(mf)) return <span className="invalid-mf">{mf}</span>;
  return <MF mf={mf} />;
});
