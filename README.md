# chemical-groups editor

Browse, check and edit the chemical groups of
[cheminfo/mass-tools](https://github.com/cheminfo/mass-tools). It reads and
writes `../mass-tools/packages/chemical-groups/src/groups.ts` — the library in a
checkout sitting next to this one — directly on disk.

```console
git clone https://github.com/cheminfo/mass-tools.git ../mass-tools
npm install
npm run dev
```

It opens on <http://localhost:10902>. Set `CHEMICAL_GROUPS_FILE` to edit another
file:

```console
CHEMICAL_GROUPS_FILE=/path/to/groups.ts npm run dev
```

Nothing is published from this repository.

## How the file is read and written

The file is served by a small webservice mounted on the vite dev server
(`server/groupsFileApi.ts`):

- `GET /api/groups` → `{ path, groups }`
- `PUT /api/groups` with `{ groups }` → rewrites `groups.ts`

`groups.ts` keeps its exact layout — a two line header, then compact JSON on one
line — so an untouched group produces no diff. Only the groups you edit are
rewritten, with the usual key order. The write goes to a temporary file that is
then renamed, so an interrupted save never truncates the data.

Changes are only written when you press **Save to groups.ts**.

## What is checked

Each group is checked against its structure and its formula:

- the formula computed from the structure, R atoms excluded, must be the `mf`
- `mass`, `monoisotopicMass`, `unsaturation` and `elements` must be the values
  computed by `mf-parser` from the `mf`, using the same expressions as the
  cheminfo view this replaces — in particular
  `unsaturation = (info.unsaturation - 1) * 2`
- symbols must be unique and a structure should have at least one R atom

R attachment points are ordinary openchemlib atoms with their own atomic
numbers (`R` = 154, `R1` = 142, `R2` = 143, `R3` = 144), which is why they show
up in `getMolecularFormula()` and have to be stripped. To draw one, hover an
atom in the editor and type `R`, `R1`, `R2` or `R3`.

## Chemical groups

The list of groups is virtualized: only the visible rows draw their structure.
Use the colored toggle buttons to filter by kind, the search box for the symbol,
name or formula, and the arrow keys to move the selection.

Groups with a generated structure carry `"toVerify": true` in the file and a
warning icon in the list. Filter them with the `to check` button and press
`Mark as checked` once the structure is right, which removes the flag.

## JSON

The whole file as JSON, with colors and foldable groups. Editing it and pressing
**Apply changes** replaces the groups of the other pages; **Save to groups.ts**
then writes them. Filtering makes the view read-only, because only a subset of
the groups is displayed.

## MF parser

Parses a molecular formula, including group symbols like `HOAlaGlyOH`, and shows
the parsed info and the elemental analysis.

## Tests

```console
npm test
```

The unit tests run against a nine group fixture, so they need no sibling
checkout. The tests that check the whole dataset are skipped when
`../mass-tools` is absent.

## License

[MIT](./LICENSE)
