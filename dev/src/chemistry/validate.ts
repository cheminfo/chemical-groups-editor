import type { Group, GroupElement } from 'chemical-groups';

import type { DerivedInfo } from './groupInfo.ts';
import { canonicalMf, getDerivedInfo } from './groupInfo.ts';
import { countRAtoms, getMfFromStructure } from './structure.ts';

export interface Issue {
  level: 'error' | 'warning';
  message: string;
}

export interface GroupAnalysis {
  /** Errors and warnings found on the group itself */
  issues: Issue[];
  /** Canonical formula computed from the structure, R atoms excluded */
  mfFromStructure: string | null;
  /** Whether the structure and the `mf` field describe the same formula */
  mfMatches: boolean;
  /** Fields recomputed from the `mf` field */
  derived: DerivedInfo | null;
  /** Number of R attachment points of the structure */
  rAtoms: number;
}

const cache = new WeakMap<Group, GroupAnalysis>();

/**
 * Check a group against its structure and its molecular formula. The result is
 * cached: groups are replaced, never mutated, when they are edited.
 * @param group - Group to check.
 * @returns The issues of the group, together with the formula, the R atom count
 * and the fields recomputed from it.
 */
export function analyzeGroup(group: Group): GroupAnalysis {
  const cached = cache.get(group);
  if (cached) return cached;
  const analysis = computeAnalysis(group);
  cache.set(group, analysis);
  return analysis;
}

/**
 * Symbols used by more than one group. `groupsObject` keeps only the last one.
 * @param groups - Complete list of groups.
 * @returns The symbols carried by at least two groups.
 */
export function getDuplicateSymbols(groups: Group[]): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const group of groups) {
    if (seen.has(group.symbol)) duplicates.add(group.symbol);
    seen.add(group.symbol);
  }
  return duplicates;
}

/**
 * All the issues of a group, including the ones that depend on the whole list.
 * @param group - Group to check.
 * @param duplicates - Symbols used by more than one group, from
 * `getDuplicateSymbols`.
 * @returns The issues of the group, the duplicated symbol first when there is
 * one.
 */
export function getIssues(group: Group, duplicates: Set<string>): Issue[] {
  const { issues } = analyzeGroup(group);
  if (!duplicates.has(group.symbol)) return issues;
  return [
    { level: 'error', message: `the symbol ${group.symbol} is used twice` },
    ...issues,
  ];
}

function computeAnalysis(group: Group): GroupAnalysis {
  const issues: Issue[] = [];
  let mfFromStructure: string | null = null;
  let mfMatches = false;
  let derived: DerivedInfo | null = null;
  let rAtoms = 0;

  if (group.toVerify) {
    issues.push({
      level: 'warning',
      message: 'the structure was generated and still has to be checked',
    });
  }
  if (!group.name) issues.push({ level: 'warning', message: 'no name' });
  if (group.oneLetter && group.oneLetter.length !== 1) {
    issues.push({ level: 'error', message: 'oneLetter must be one character' });
  }

  try {
    derived = getDerivedInfo(group.mf);
  } catch (error) {
    issues.push({ level: 'error', message: `invalid mf: ${String(error)}` });
  }
  if (derived) issues.push(...compareDerived(group, derived));

  if (group.ocl?.value) {
    try {
      mfFromStructure = toCanonical(getMfFromStructure(group.ocl));
      rAtoms = countRAtoms(group.ocl);
      mfMatches = mfFromStructure === toCanonical(group.mf);
      if (!mfMatches) {
        issues.push({
          level: 'error',
          message: `the structure gives ${mfFromStructure || 'nothing'} but mf is ${group.mf}`,
        });
      }
      if (rAtoms === 0) {
        issues.push({
          level: 'warning',
          message: 'the structure has no R attachment point',
        });
      }
    } catch (error) {
      issues.push({
        level: 'error',
        message: `invalid structure: ${String(error)}`,
      });
    }
  } else {
    issues.push({ level: 'warning', message: 'no structure' });
  }

  return { issues, mfFromStructure, mfMatches, derived, rAtoms };
}

function toCanonical(mf: string): string {
  if (!mf) return '';
  try {
    return canonicalMf(mf);
  } catch {
    return mf;
  }
}

function compareDerived(group: Group, derived: DerivedInfo): Issue[] {
  const issues: Issue[] = [];
  for (const key of ['mass', 'monoisotopicMass', 'unsaturation'] as const) {
    if (!isSame(group[key], derived[key])) {
      issues.push({
        level: 'error',
        message: `${key} is ${group[key]} but ${group.mf} gives ${derived[key]}`,
      });
    }
  }
  if (
    stringifyElements(group.elements) !== stringifyElements(derived.elements)
  ) {
    issues.push({
      level: 'error',
      message: `elements are ${stringifyElements(group.elements)} but ${group.mf} gives ${stringifyElements(derived.elements)}`,
    });
  }
  return issues;
}

function isSame(stored: number | null, computed: number | null): boolean {
  if (stored === null || computed === null) return stored === computed;
  if (typeof stored !== 'number') return false;
  return Math.abs(stored - computed) <= 1e-9 * Math.max(1, Math.abs(computed));
}

function stringifyElements(elements: GroupElement[] | undefined): string {
  if (!Array.isArray(elements)) return '';
  return elements
    .map(
      (element) =>
        `${element.isotope ? `[${element.isotope}]` : ''}${element.symbol}${element.number}`,
    )
    .join(' ');
}
