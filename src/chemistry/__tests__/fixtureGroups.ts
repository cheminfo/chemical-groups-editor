import type { Group } from '../../types.ts';

/**
 * Nine groups copied verbatim from the library, so that the checks of the
 * editor run against real data without a sibling checkout. `Xle` is the one
 * group of the data that has no structure.
 */
const FIXTURE_GROUPS: Group[] = [
  {
    symbol: 'Abu',
    name: '2-Aminobutyric acid diradical',
    mf: 'C4H7NO',
    kind: 'aa',
    ocl: { value: 'dazHPBPOEgEInVZjcH@', coordinates: '!Bb@I~@Ha}_c~H@m]}bGt' },
    mass: 85.10463700109551,
    monoisotopicMass: 85.05276384961,
    unsaturation: 2,
    elements: [
      { symbol: 'C', number: 4 },
      { symbol: 'H', number: 7 },
      { symbol: 'N', number: 1 },
      { symbol: 'O', number: 1 },
    ],
  },
  {
    symbol: 'Acet',
    name: 'Acetyl',
    mf: 'C2H3O',
    ocl: { value: 'gCaHDEeIi`@', coordinates: '!BbOq~@Ha}' },
    mass: 43.04469897995611,
    monoisotopicMass: 43.01838971626,
    unsaturation: 1,
    elements: [
      { symbol: 'C', number: 2 },
      { symbol: 'H', number: 3 },
      { symbol: 'O', number: 1 },
    ],
  },
  {
    symbol: 'Ala',
    name: 'Alanine diradical',
    mf: 'C3H5NO',
    kind: 'aa',
    oneLetter: 'A',
    alternativeOneLetter: 'α',
    ocl: { value: 'gNyDBaxmqR[fZjZ@', coordinates: '!BbOr~@H`}bOr~Wxb}' },
    mass: 71.07801959624871,
    monoisotopicMass: 71.03711378515,
    unsaturation: 2,
    elements: [
      { symbol: 'C', number: 3 },
      { symbol: 'H', number: 5 },
      { symbol: 'N', number: 1 },
      { symbol: 'O', number: 1 },
    ],
  },
  {
    symbol: 'Argp',
    name: 'Arginine triradical',
    mf: 'C6H11N4O',
    kind: 'aa',
    ocl: {
      value: 'dglhpHpil@gWDEI[UYZfjji`T@',
      coordinates: '!BbGvHGx@bGvH@ha}bOrH_Wxb@KW_Wx@bGt',
    },
    mass: 155.1779814451265,
    monoisotopicMass: 155.09328599182,
    unsaturation: 5,
    elements: [
      { symbol: 'C', number: 6 },
      { symbol: 'H', number: 11 },
      { symbol: 'N', number: 4 },
      { symbol: 'O', number: 1 },
    ],
  },
  {
    symbol: 'Bz',
    name: 'Benzoyl',
    mf: 'C7H5O',
    ocl: {
      value: 'didH`DAYR[e^FX@@@@',
      coordinates: '!BbOq~@Ha}b@I~Oxa}bGu~Op',
    },
    mass: 105.1142599717439,
    monoisotopicMass: 105.03403978072,
    unsaturation: 9,
    elements: [
      { symbol: 'C', number: 7 },
      { symbol: 'H', number: 5 },
      { symbol: 'O', number: 1 },
    ],
  },
  {
    symbol: 'Gly',
    name: 'Glycine diradical',
    mf: 'C2H3NO',
    kind: 'aa',
    oneLetter: 'G',
    alternativeOneLetter: 'γ',
    ocl: { value: 'gGYDBaxuqR[Yj@@', coordinates: '!BbOq~@Ha}bOrH_P' },
    mass: 57.051402191401905,
    monoisotopicMass: 57.021463720689994,
    unsaturation: 2,
    elements: [
      { symbol: 'C', number: 2 },
      { symbol: 'H', number: 3 },
      { symbol: 'N', number: 1 },
      { symbol: 'O', number: 1 },
    ],
  },
  {
    symbol: 'Msu',
    name: '5-aminomethyl-2-selenouridine monophosphate diradical 20510U',
    mf: 'C10H14N3O7PSe',
    kind: 'RNApMod',
    oneLetter: 'π',
    ocl: {
      value: 'fasqp`I^{BgEIrtGc[p\\bQ\\\\bTTTvTRbTfUSNAKUUUULsTuDQLPbY@@',
      coordinates:
        '!BNuSFPDlDTEHt_pHtP@H_TuPBOpcbpXBGtSItuPSU@H_Wtw@`lFBpXSU@@tP',
    },
    mass: 398.1676241841323,
    monoisotopicMass: 398.97345859992004,
    unsaturation: null,
    elements: [
      { symbol: 'C', number: 10 },
      { symbol: 'H', number: 14 },
      { symbol: 'N', number: 3 },
      { symbol: 'O', number: 7 },
      { symbol: 'P', number: 1 },
      { symbol: 'Se', number: 1 },
    ],
  },
  {
    symbol: 'Ph',
    name: 'Phenyl',
    mf: 'C6H5',
    ocl: { value: 'gOpH@liLkW@@@@', coordinates: '!B|Owp_Gy|OwpWy' },
    mass: 77.10411915069038,
    monoisotopicMass: 77.03912516115,
    unsaturation: 7,
    elements: [
      { symbol: 'C', number: 6 },
      { symbol: 'H', number: 5 },
    ],
  },
  {
    symbol: 'Xle',
    name: 'Leucine or Isoleucine diradical',
    mf: 'C6H11NO',
    kind: 'aa',
    oneLetter: 'J',
    mass: 113.15787181078912,
    monoisotopicMass: 113.08406397853,
    unsaturation: 2,
    elements: [
      { symbol: 'C', number: 6 },
      { symbol: 'H', number: 11 },
      { symbol: 'N', number: 1 },
      { symbol: 'O', number: 1 },
    ],
  },
];

/**
 * Group of the fixture.
 * @param symbol - Symbol of the group.
 * @returns The group carrying that symbol.
 */
export function groupBySymbol(symbol: string): Group {
  const group = FIXTURE_GROUPS.find((candidate) => candidate.symbol === symbol);
  if (!group) throw new Error(`no group with the symbol ${symbol}`);
  return group;
}
