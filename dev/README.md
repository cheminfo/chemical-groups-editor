# chemical-groups dev

Local playground used to browse, check and edit `src/groups.ts`. It is not
published and it is not part of the package.

```console
npm run dev
```

It runs on <http://localhost:10902> and resolves `chemical-groups` to `src`, so
there is nothing to build first and any change in the package is hot reloaded.

## Chemical groups

Replaces the [cheminfo view](https://www.cheminfo.org/?viewURL=https%3A%2F%2Fcouch.cheminfo.org%2Fcheminfo-public%2F2b7d0688e43300da6a97de7cde0342b7%2Fview.json&loadversion=true&fillsearch=MF+groups+editor)
that was used to edit the file. It is read and written directly on disk through
a small webservice mounted on the vite dev server (`server/groupsFileApi.ts`):

- `GET /api/groups` → `{ path, groups }`
- `PUT /api/groups` with `{ groups }` → rewrites `src/groups.ts`

`groups.ts` keeps its exact layout — a two line header, then compact JSON on one
line — so an untouched group produces no diff. Only the groups you edit are
rewritten, with the usual key order.

Each group is checked against its structure and its formula:

- the formula computed from the structure, R atoms excluded, must be the `mf`
- `mass`, `monoisotopicMass`, `unsaturation` and `elements` must be the values
  computed by `mf-parser` from the `mf`, using the same expressions as the
  cheminfo view — in particular `unsaturation = (info.unsaturation - 1) * 2`
- symbols must be unique and a structure should have at least one R atom

Changes are only written when you press **Save to groups.ts**.

R attachment points are ordinary openchemlib atoms with their own atomic
numbers (`R` = 154, `R1` = 142, `R2` = 143, `R3` = 144), which is why they show
up in `getMolecularFormula()` and have to be stripped. To draw one, hover an
atom in the editor and type `R`, `R1`, `R2` or `R3`.

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
the parsed info and the elemental analysis. `mf-parser` is a development
dependency only: it is what the checks above are computed with.
