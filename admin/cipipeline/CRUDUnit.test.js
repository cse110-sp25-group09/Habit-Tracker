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

let page, browser;
let url = '../../localstorage.html';

describe('Create a habit data object in localStorage', () => {
  beforeAll(async () => {
    // Dynamically import the script so it works with ESM
    // await import('../../out/scripts/home.js');
    localStorage.clear();
    // If crypto already exists, we just override randomUUID
    if (!globalThis.crypto) {
      globalThis.crypto = {};
    }
    // Mock randomUUID
    globalThis.crypto.randomUUID = jest.fn(() => 'mocked-uuid');
  });

  it('creates a new habit data object with an id & 5 specific fields', async()=>{
    let testCall0 = createHabit(
      '',
      '',
      1,
    localStorageAdapter,
    );

    expect(testCall0).toStrictEqual("idmocked-uuid");

    const habitData = localStorage.getItem(testCall0)

    expect(JSON.parse(habitData)).toBeInstanceOf(Object);
    expect(JSON.parse(habitData)).toHaveProperty('habitName');
    expect(JSON.parse(habitData)).toHaveProperty('habitDescription');
    expect(JSON.parse(habitData)).toHaveProperty('habitFrequency');
    expect(JSON.parse(habitData)).toHaveProperty('habitStreak');
    expect(JSON.parse(habitData)).toHaveProperty('logs');
  });

  it('stores correct habit data in localStorage', async () => {
    let testCall1 = createHabit(
      'Drink Water',
      'Fill glass, lift to mouth and swallow',
      1,
      localStorageAdapter,
    );
    const habitData = await localStorage.getItem(testCall1);
    const habitDataRef = {

      habitName: 'Drink Water',
      habitDescription: 'Fill glass, lift to mouth and swallow',
      habitFrequency: 1,
      habitStreak: 0,
      logs: []

    };
    expect(habitData).toEqual(JSON.stringify(habitDataRef));
  });
});

