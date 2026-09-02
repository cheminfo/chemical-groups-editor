# chemical-groups

[![NPM version](https://img.shields.io/npm/v/chemical-groups.svg)](https://www.npmjs.com/package/chemical-groups)
[![npm download](https://img.shields.io/npm/dm/chemical-groups.svg)](https://www.npmjs.com/package/chemical-groups)
[![test coverage](https://img.shields.io/codecov/c/github/cheminfo/chemical-groups.svg)](https://codecov.io/gh/cheminfo/chemical-groups)
[![license](https://img.shields.io/npm/l/chemical-groups.svg)](https://github.com/cheminfo/chemical-groups/blob/main/LICENSE)

Chemical groups used in organic chemistry, like `Ph`, `Tips` or `Ala`.

Each group carries its molecular formula, its exact and monoisotopic masses, its
elemental composition, its structure as an [openchemlib](https://github.com/cheminfo/openchemlib-js)
idcode with R attachment points, and — for the amino acids and the
nucleotides — its one letter code. The package has no dependency.

## Installation

```console
npm install chemical-groups
```

## Usage

```js
import { groups, groupsObject, groupsToSequence } from 'chemical-groups';

groups.length;
// 304

groupsObject.Ala;
// {
//   symbol: 'Ala',
//   name: 'Alanine diradical',
//   mf: 'C3H5NO',
//   kind: 'aa',
//   oneLetter: 'A',
//   alternativeOneLetter: 'α',
//   ocl: { value: 'gNyDBaxmqR[fZjZ@', coordinates: '…' },
//   mass: 71.07801959624871,
//   monoisotopicMass: 71.03711378515,
//   unsaturation: 2,
//   elements: [{ symbol: 'C', number: 3 }, …],
// }

groupsToSequence('HOAlaGlyOH');
// 'AG'
```

The `Group`, `GroupElement` and `GroupOcl` types are exported as well.

## The data

`src/groups.ts` holds the whole list on a single line of compact JSON, so that
editing one group produces a one-group diff instead of a whole-file one. It is
in `.prettierignore` and in the eslint ignores for that reason — never reformat
it, and never edit it by hand.

`R`, `R1`, `R2` and `R3` are the attachment points. They are ordinary
openchemlib atoms with their own atomic numbers (154, 142, 143, 144), so they
appear in the structure but are excluded from `mf`. A monoradical uses `R`, a
diradical `R1` on the amine side and `R2` on the carbonyl side, a triradical
adds `R3` for the side chain.

Every group is checked by the test suite: `mf` must be the formula of the
structure with the R atoms removed, and `mass`, `monoisotopicMass`,
`unsaturation` and `elements` must be what [`mf-parser`](https://github.com/cheminfo/mass-tools)
computes from `mf`.

## Editing the groups

```console
npm run dev
```

This opens the playground on <http://localhost:10902>: a list of the groups with
their structures, a structure editor, a JSON view and an `mf-parser` page. It
reads and writes `src/groups.ts` directly, and reports every group whose
structure and formula disagree. See [`dev/README.md`](./dev/README.md).

## License

[MIT](./LICENSE)
