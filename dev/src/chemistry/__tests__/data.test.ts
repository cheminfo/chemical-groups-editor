import { groups } from 'chemical-groups';
import { expect, test } from 'vitest';

import { getDuplicateSymbols, getIssues } from '../validate.ts';

const TO_VERIFY = 'the structure was generated and still has to be checked';
const NO_STRUCTURE = 'no structure';
const NO_ATTACHMENT_POINT = 'the structure has no R attachment point';

const duplicates = getDuplicateSymbols(groups);

test('no group of the data carries an error', () => {
  const errors: string[] = [];
  for (const group of groups) {
    for (const issue of getIssues(group, duplicates)) {
      if (issue.level === 'error') {
        errors.push(`${group.symbol}: ${issue.message}`);
      }
    }
  }

  expect(errors).toStrictEqual([]);
  expect([...duplicates]).toStrictEqual([]);
  expect(groups.length).toBeGreaterThan(300);
});

test('the warnings of the data are the ones that are known', () => {
  const toVerify: string[] = [];
  const withoutStructure: string[] = [];
  const withoutAttachmentPoint: string[] = [];
  const unexpected: string[] = [];
  for (const group of groups) {
    for (const issue of getIssues(group, duplicates)) {
      if (issue.level !== 'warning') continue;
      if (issue.message === TO_VERIFY) {
        toVerify.push(group.symbol);
      } else if (issue.message === NO_STRUCTURE) {
        withoutStructure.push(group.symbol);
      } else if (issue.message === NO_ATTACHMENT_POINT) {
        withoutAttachmentPoint.push(group.symbol);
      } else {
        unexpected.push(`${group.symbol}: ${issue.message}`);
      }
    }
  }

  expect(unexpected).toStrictEqual([]);
  expect(toVerify.toSorted()).toStrictEqual(['Hva', 'Stap']);
  expect(withoutStructure.toSorted()).toStrictEqual(['Xle']);
  expect(withoutAttachmentPoint.toSorted()).toStrictEqual([
    'Pqb',
    'Pqg',
    'Qba',
  ]);
});
