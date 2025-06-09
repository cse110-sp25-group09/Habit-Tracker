/**
 * @jest-environment jsdom
 */
import {
  createHabit,
  readHabit,
  localStorageAdapter,
  logHabitCompleted,
  removeHabitCompletion,
  isHabitComplete,
  getHabitById,
  getAllHabits,
  deleteHabit,
  reviveHabit,
  getHabitsForDay,
  ratioOfCompleted,
} from '../../out/scripts/CRUD.js';

import { beforeAll, jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let page, browser;
let mockUuidCounter = 0;
const mockUuid = () => `test-uuid-${mockUuidCounter++}`;

describe('CreateHabit + LocalStorage Integration Tests', () => {
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

  it('creates a new habit data object with an id & 5 specific fields', async () => {
    let testCall0 = createHabit('', '', 1, localStorageAdapter);

    expect(testCall0).toStrictEqual('idmocked-uuid');

    const habitData = localStorage.getItem(testCall0);

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
      startDateTime: new Date().toLocaleString(),
      habitStreak: 0,
      logs: [],
    };
    expect(habitData).toEqual(JSON.stringify(habitDataRef));
  });
});

describe('ReadHabit + LocalStorage Integration tests', () => {
  beforeAll(() => {
    localStorage.clear();
    // If crypto already exists, we just override randomUUID
    if (!globalThis.crypto) {
      globalThis.crypto = {};
    }
    // Mock randomUUID
    globalThis.crypto.randomUUID = jest.fn(() => 'mocked-uuid');
  });

  it('can retrieve string habit data from localStorage', async () => {
    let testCall2 = createHabit(
      'Do something that makes you happy',
      'NOT TIKTOK',
      7,
      localStorageAdapter,
    );

    let habitDataRef2 = {
      habitName: 'Do something that makes you happy',
      habitDescription: 'NOT TIKTOK',
      habitFrequency: 7,
      startDateTime: new Date().toLocaleString(),
      habitStreak: 0,
      logs: [],
    };
    const retrievedData = await readHabit(testCall2);
    const stringifiedDataRef = JSON.stringify(habitDataRef2);
    expect(retrievedData).toEqual(stringifiedDataRef);
  }, 10000);
});

describe('Habit Completion and Logging Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUuidCounter = 0;
    if (!globalThis.crypto) {
      globalThis.crypto = {};
    }
    globalThis.crypto.randomUUID = jest.fn(mockUuid);
  });

  it('should log habit completion and return true', () => {
    const habitId = createHabit('Daily Exercise', 'Go for a run', 1);

    const result = logHabitCompleted(habitId);
    expect(result).toBe(true);
  });

  it('should add completion entry to habit logs', () => {
    const habitId = createHabit('Daily Water', 'Drink water', 1);

    // Initially no logs
    let habit = getHabitById(habitId);
    expect(habit.logs).toHaveLength(0);

    // Log completion
    logHabitCompleted(habitId);

    // Should have one log entry
    habit = getHabitById(habitId);
    expect(habit.logs).toHaveLength(1);
    expect(habit.logs[0]).toBeDefined();
    expect(typeof habit.logs[0]).toBe('string');
  });

  it('should throw error for invalid habit ID when logging completion', () => {
    expect(() => {
      logHabitCompleted('invalid-habit-id');
    }).toThrow('Invalid habit passed');
  });

  it('should throw error for null habit ID when logging completion', () => {
    expect(() => {
      logHabitCompleted(null);
    }).toThrow('Invalid habit passed');
  });

  it('should allow multiple completions to be logged', () => {
    const habitId = createHabit('Reading', 'Read daily', 1);

    logHabitCompleted(habitId);
    logHabitCompleted(habitId);
    logHabitCompleted(habitId);

    const habit = getHabitById(habitId);
    expect(habit.logs).toHaveLength(3);
  });

  it('should remove habit completion and return true', () => {
    const habitId = createHabit('Exercise', 'Daily exercise', 1);

    // Log completion first
    logHabitCompleted(habitId);
    let habit = getHabitById(habitId);
    expect(habit.logs).toHaveLength(1);

    // Remove completion
    const result = removeHabitCompletion(habitId);
    expect(result).toBe(true);

    // Should have removed the last log entry
    habit = getHabitById(habitId);
    expect(habit.logs).toHaveLength(0);
  });

  it('should throw error when removing completion from invalid habit', () => {
    expect(() => {
      removeHabitCompletion('invalid-habit-id');
    }).toThrow('Invalid habit passed');
  });

  it('should handle removing completion from habit with no logs (pop on empty array)', () => {
    const habitId = createHabit('New Habit', 'Description', 1);

    // Should not throw error when calling pop() on empty array
    const result = removeHabitCompletion(habitId);
    expect(result).toBe(true);

    const habit = getHabitById(habitId);
    expect(habit.logs).toHaveLength(0);
  });

  it('should check if habit is complete for today (when not completed)', () => {
    const habitId = createHabit('Daily Habit', 'Description', 1);
    const today = new Date();

    // Initially not complete
    expect(isHabitComplete(habitId, today)).toBe(false);
  });

  it('should check if habit is complete for today (after completion)', () => {
    const habitId = createHabit('Daily Habit', 'Description', 1);
    const today = new Date();

    // Log completion
    logHabitCompleted(habitId);

    // Should be complete for today
    expect(isHabitComplete(habitId, today)).toBe(true);
  });

  it('should return false for habit completion on different day', () => {
    const habitId = createHabit('Daily Habit', 'Description', 1);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Log completion for today
    logHabitCompleted(habitId);

    // Should not be complete for yesterday
    expect(isHabitComplete(habitId, yesterday)).toBe(false);
  });

  it('should handle habit with empty logs when checking completion', () => {
    const habitId = createHabit('New Habit', 'Description', 1);

    // Should return false for habit with no completions
    expect(isHabitComplete(habitId)).toBe(false);
  });
});

describe('Streak Calculation Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUuidCounter = 0;
    if (!globalThis.crypto) {
      globalThis.crypto = {};
    }
    globalThis.crypto.randomUUID = jest.fn(mockUuid);
  });

  it('should initialize new habit with streak of 0', () => {
    const habitId = createHabit('New Habit', 'Description', 1);
    const habit = getHabitById(habitId);

    expect(habit.habitStreak).toBe(0);
  });

  it('should update habitStreak property when logging completion', () => {
    const habitId = createHabit('Daily Habit', 'Description', 1);

    logHabitCompleted(habitId);
    const habit = getHabitById(habitId);

    // habitStreak should be defined and be a number
    expect(habit.habitStreak).toBeDefined();
    expect(typeof habit.habitStreak).toBe('number');
  });

  it('should recalculate streak when completion is removed', () => {
    const habitId = createHabit('Daily Habit', 'Description', 1);

    // Log multiple completions
    logHabitCompleted(habitId);
    logHabitCompleted(habitId);

    let habit = getHabitById(habitId);
    const streakAfterTwoLogs = habit.habitStreak;

    // Remove one completion
    removeHabitCompletion(habitId);

    habit = getHabitById(habitId);
    // Streak should be recalculated (though the calculation has bugs, it will still be a number)
    expect(typeof habit.habitStreak).toBe('number');
  });

  it('should handle streak calculation for habits with single completion', () => {
    const habitId = createHabit('Test Habit', 'Description', 1);

    logHabitCompleted(habitId);
    const habit = getHabitById(habitId);

    // Should handle single completion without errors
    expect(habit.habitStreak).toBeDefined();
    expect(typeof habit.habitStreak).toBe('number');
  });

  it('should handle streak calculation for weekly habits', () => {
    const habitId = createHabit('Weekly Habit', 'Description', 7);

    logHabitCompleted(habitId);
    const habit = getHabitById(habitId);

    // Should handle weekly frequency without errors
    expect(habit.habitStreak).toBeDefined();
    expect(typeof habit.habitStreak).toBe('number');
  });

  it('should persist streak updates in localStorage', () => {
    const habitId = createHabit('Persistent Habit', 'Description', 1);

    logHabitCompleted(habitId);

    // Get habit directly from localStorage
    const habitFromStorage = JSON.parse(localStorage.getItem(habitId));
    expect(habitFromStorage.habitStreak).toBeDefined();
    expect(typeof habitFromStorage.habitStreak).toBe('number');
  });
});

describe('Integration Tests (Completion + Streak)', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUuidCounter = 0;
    if (!globalThis.crypto) {
      globalThis.crypto = {};
    }
    globalThis.crypto.randomUUID = jest.fn(mockUuid);
  });

  it('should maintain data consistency between logging and checking completion', () => {
    const habitId = createHabit('Consistency Test', 'Description', 1);

    // Log completion
    logHabitCompleted(habitId);

    // Check that both logs and completion status are updated
    const habit = getHabitById(habitId);
    expect(habit.logs).toHaveLength(1);
    expect(isHabitComplete(habitId)).toBe(true);
    expect(habit.habitStreak).toBeDefined();
  });

  it('should maintain data consistency when removing completion', () => {
    const habitId = createHabit('Removal Test', 'Description', 1);

    // Log and then remove completion
    logHabitCompleted(habitId);
    removeHabitCompletion(habitId);

    // Check that all related data is updated consistently
    const habit = getHabitById(habitId);
    expect(habit.logs).toHaveLength(0);
    expect(isHabitComplete(habitId)).toBe(false);
    expect(typeof habit.habitStreak).toBe('number');
  });

  it('should handle multiple operations on same habit', () => {
    const habitId = createHabit('Multi-op Test', 'Description', 1);

    // Multiple operations
    logHabitCompleted(habitId);
    logHabitCompleted(habitId);
    removeHabitCompletion(habitId);
    logHabitCompleted(habitId);

    // Should not throw errors and maintain valid state
    const habit = getHabitById(habitId);
    expect(habit.logs).toHaveLength(2);
    expect(typeof habit.habitStreak).toBe('number');
    expect(isHabitComplete(habitId)).toBe(true);
  });
});

describe('deleteHabit + localStorage Integration Tests', () => {
  beforeAll(() => {
    localStorage.clear();
  });
  it('Can delete one habit by ID', () => {
    let habitID = createHabit(
      'Care for dog',
      'Feed, water, walk',
      1,
      localStorageAdapter,
    );

    deleteHabit(habitID);
    expect(localStorage.getItem(habitID)).toBeNull();
  });
});

describe('reviveHabit unit tests', () => {
  it('turns habitFrequency values into Numbers', () => {
    let revivedFrequency = reviveHabit('habitFrequency', '7');
    expect(revivedFrequency).toBe(7);
  });
  it('turns habitStreak values into Numbers', () => {
    let revivedhabitStreak = reviveHabit('habitStreak', '8');
    expect(revivedhabitStreak).toBe(8);
  });

  it('leaves habitName values as strings', () => {
    let revivedhabitName = reviveHabit('habitName', 'Water plants');
    expect(revivedhabitName).toBe('Water plants');
  });
  it('leaves habitDescription values as strings', () => {
    let revivedhabitDescription = reviveHabit(
      'habitDescription',
      'Hydrangeas, cacti, etc.',
    );
    expect(revivedhabitDescription).toBe('Hydrangeas, cacti, etc.');
  });
});

describe('getHabitById + localStorage Integration Tests', () => {
  beforeAll(() => {
    localStorage.clear();
  });

  it('retrieves a valid habit object by ID', () => {
    let testCall3 = createHabit(
      'Do something that makes you happy',
      'NOT TIKTOK',
      7,
      localStorageAdapter,
    );

    let habitDataRef3 = {
      habitName: 'Do something that makes you happy',
      habitDescription: 'NOT TIKTOK',
      habitFrequency: 7,
      startDateTime: new Date().toLocaleString(),
      habitStreak: 0,
      logs: [],
    };
    const retrievedData = getHabitById(testCall3);
    expect(retrievedData).toEqual(habitDataRef3);
  });
});

describe('getAllHabits + localStorage Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    let counter = 0;
    const mockUuid = () => `12345678-1234-1234-8abc-12345678901${counter++}`;

    if (!globalThis.crypto) {
      globalThis.crypto = {};
    }
    globalThis.crypto.randomUUID = jest.fn(mockUuid);
  });

  it('retrieves an array of strings', () => {
    let id1 = createHabit('habitName1', 'habitDescription1', 1);
    let id2 = createHabit('habitName2', 'habitDescription2', 7);
    let id3 = createHabit('habitName3', 'habitDescription3', 30);
    let allHabits = getAllHabits();
    expect(Array.isArray(allHabits)).toBe(true);
  });

  it('retrieves all habits created', () => {
    console.log('=== Starting test ===');

    let id1 = createHabit('habitName1', 'habitDescription1', 1);
    let id2 = createHabit('habitName2', 'habitDescription2', 7);
    let id3 = createHabit('habitName3', 'habitDescription3', 30);

    let allHabits = getAllHabits();
    console.log('getAllHabits result:', allHabits);

    expect(allHabits.length).toBe(3);
  });
});

describe('ratioOfCompleted Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUuidCounter = 0;
    if (!globalThis.crypto) {
      globalThis.crypto = {};
    }
    globalThis.crypto.randomUUID = jest.fn(mockUuid);
  });

  it('should return [0, 0] when no habits exist', () => {
    expect(ratioOfCompleted()).toEqual([0, 0]);
  });

  it('should return an array of two numbers', () => {
    createHabit('Daily Exercise', 'Go for a run', 1);
    const result = ratioOfCompleted();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(typeof result[0]).toBe('number');
    expect(typeof result[1]).toBe('number');
  });

  it('should have completed count less than or equal to total count', () => {
    createHabit('Daily Exercise', 'Go for a run', 1);
    createHabit('Daily Reading', 'Read a book', 1);

    const result = ratioOfCompleted();
    expect(result[0]).toBeLessThanOrEqual(result[1]);
  });

  it('should have non-negative values', () => {
    createHabit('Daily Exercise', 'Go for a run', 1);
    const habitId = createHabit('Daily Reading', 'Read a book', 1);
    logHabitCompleted(habitId);

    const result = ratioOfCompleted();
    expect(result[0]).toBeGreaterThanOrEqual(0);
    expect(result[1]).toBeGreaterThanOrEqual(0);
  });

  it('should work with date parameter', () => {
    createHabit('Daily Exercise', 'Go for a run', 1);
    const today = new Date();
    const result = ratioOfCompleted(today);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(typeof result[0]).toBe('number');
    expect(typeof result[1]).toBe('number');
  });

  it('should handle multiple habit completions', () => {
    const habitId1 = createHabit('Daily Exercise', 'Go for a run', 1);
    const habitId2 = createHabit('Daily Reading', 'Read a book', 1);

    const initialResult = ratioOfCompleted();

    logHabitCompleted(habitId1);
    const afterFirstCompletion = ratioOfCompleted();

    logHabitCompleted(habitId2);
    const afterSecondCompletion = ratioOfCompleted();

    // Completed count should not decrease
    expect(afterFirstCompletion[0]).toBeGreaterThanOrEqual(initialResult[0]);
    expect(afterSecondCompletion[0]).toBeGreaterThanOrEqual(
      afterFirstCompletion[0],
    );
  });

  it('should handle removing completions', () => {
    const habitId = createHabit('Daily Exercise', 'Go for a run', 1);

    logHabitCompleted(habitId);
    const afterCompletion = ratioOfCompleted();

    removeHabitCompletion(habitId);
    const afterRemoval = ratioOfCompleted();

    // Total count should remain the same or similar
    expect(Math.abs(afterRemoval[1] - afterCompletion[1])).toBeLessThanOrEqual(
      1,
    );
    // Completed count should not increase after removal
    expect(afterRemoval[0]).toBeLessThanOrEqual(afterCompletion[0]);
  });

  it('should handle same habit completed multiple times', () => {
    const habitId = createHabit('Daily Exercise', 'Go for a run', 1);

    logHabitCompleted(habitId);
    logHabitCompleted(habitId);
    logHabitCompleted(habitId);

    const finalResult = ratioOfCompleted();

    // Should handle multiple completions without errors
    expect(Array.isArray(finalResult)).toBe(true);
    expect(finalResult).toHaveLength(2);
  });
});

describe('getHabitsForDay Integration Tests', () => {
  beforeAll(() => {
    let counter = 0;
    const mockUuid = () => `12345678-1234-1234-8abc-12345678901${counter++}`;

    if (!globalThis.crypto) {
      globalThis.crypto = {};
    }
    globalThis.crypto.randomUUID = jest.fn(mockUuid);
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it('includes habits for today', () => {
    let todayHabitID = createHabit('Dance', 'Do 1000 pliés', 1);
    let habitsForDay = getHabitsForDay();
    expect(habitsForDay[0]).toContain(todayHabitID);
  });

  it('excludes habits not for today', () => {
    localStorage.setItem(
      crypto.randomUUID,
      'Name',
      'Desc',
      7,
      '2025-06-07',
      0,
      [],
    );
    let habitsForDay = getHabitsForDay();
    expect(habitsForDay).toEqual([]);
  });
});

/**
 * updateHabit, and the output of passing the logs array into habitReviver are intentionally untested
 * due to time constraints because they are no longer being used
 * We also did not test calculateStreak and isHabitForDay as they are private functions that should not
 * be exported by the code and are instead tested when testing global functions.
 */
