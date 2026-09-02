export interface GroupOcl {
  /** OCL idcode of the structure, R atoms included */
  value: string;
  /** OCL encoded 2D coordinates */
  coordinates?: string;
}

export interface GroupElement {
  /** Symbol of the element, like `C` or `Na` */
  symbol: string;
  /** Number of atoms of this element in the group */
  number: number;
  /** Nominal mass, only present for a specific isotope like `[3H]` */
  isotope?: number;
}

export interface Group {
  /** Symbol used in a molecular formula, like `Ala` or `Ph` */
  symbol: string;
  name: string;
  /** Molecular formula of the group, without the R atoms */
  mf: string;
  /** `aa`, `DNA`, `RNA`, … */
  kind?: string;
  /** One letter code, for the groups that have one, like `A` for `Ala` */
  oneLetter?: string;
  /** Second one letter code, like `α` for `Ala` */
  alternativeOneLetter?: string;
  /**
   * Set on the groups whose structure was generated instead of drawn, and that
   * still have to be checked by a human. Removed once the group is checked.
   */
  toVerify?: boolean;
  /** Structure of the group, with its R attachment points */
  ocl?: GroupOcl;
  mass: number;
  monoisotopicMass: number;
  /**
   * Number of missing hydrogens, twice the double bond equivalent. `null` when
   * the formula contains an atom without a known unsaturation.
   */
  unsaturation: number | null;
  elements: GroupElement[];
}
