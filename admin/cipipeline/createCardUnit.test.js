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

let page;
let url = '../../localstorage.html';

describe('Create a card data object in localStorage or a database', () => {
  beforeAll(async () => {
    // Dynamically import the script so it works with ESM
    // await import('../../out/scripts/home.js');
    localStorage.clear();
  });

  it('Check for card data in localStorage', async () => {
    const mockCrypto = jest.fn();
    mockCrypto.mockImplementation(() => 'mocked-uuid');
    let testCall1 = createHabit(
      'Drink Water',
      'Fill glass, lift to mouth and swallow',
      24,
      'Sun May 25 2025 13:04:28 GMT-0700 (Pacific Daylight Time)',
      localStorageAdapter,
    );
    const cardData = localStorage.getItem(testCall1);
    const cardDataRef = {
      habitName: 'Drink Water',
      habitDescription: 'Fill glass, lift to mouth and swallow',
      habitFrequency: '24',
      startDateTime:
        'Sun May 25 2025 13:04:28 GMT-0700 (Pacific Daylight Time)',
      habitStreak: '0',
      
    };
    expect(JSON.parse(cardData)).toBe(cardDataRef);
  });
});
