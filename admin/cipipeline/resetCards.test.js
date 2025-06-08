/**
 * @jest-environment jsdom
 */
import {
  createHabit,
  localStorageAdapter,
  reviveHabit,
} from '../../out/scripts/CRUD.js';

import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Reset Cards functionality', () => {
  beforeEach(() => {
    localStorage.clear();
    // Fill localStorage with test data
    localStorage.setItem('id123e4567-e89b-12d3-a456-426614174000', 'some data');
    localStorage.setItem('otherKey', 'some other data');
  });

  it('deletes all keys matching UUID regex', () => {
    const keys = localStorageAdapter.keys();
    const uuidRegex =
      /^id[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    keys.forEach((key) => {
      if (uuidRegex.test(key)) {
        localStorageAdapter.del(key);
      }
    });

    expect(
      localStorage.getItem('id123e4567-e89b-12d3-a456-426614174000'),
    ).toBeNull();
    expect(localStorage.getItem('otherKey')).toBe('some other data');
  });
});
