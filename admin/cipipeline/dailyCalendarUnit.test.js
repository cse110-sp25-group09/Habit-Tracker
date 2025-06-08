/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';

// 🧪 Mock all exports used in daily-calander.js
jest.unstable_mockModule('../../out/scripts/CRUD.js', () => ({
  getAllHabits: jest.fn(),
  isHabitComplete: jest.fn(),
  logHabitCompleted: jest.fn(),
  removeHabitCompletion: jest.fn(),
}));

// ⬅️ Load mocked CRUD module and daily calendar after the mock
const { getAllHabits, isHabitComplete } = await import('../../out/scripts/CRUD.js');
await import('../../out/scripts/daily-calander.js');

const { DailyCalendar } = window;

describe('Daily Calendar Module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="prev-day"><div class="day-name"></div><div class="day-date"></div></div>
      <div id="current-day"><div class="day-name"></div><div class="day-date"></div></div>
      <div id="next-day"><div class="day-name"></div><div class="day-date"></div></div>
      <div id="prev-habits"></div>
      <div id="current-habits"></div>
      <div id="next-habits"></div>
    `;
    jest.clearAllMocks();
  });

  describe('isHabitActiveOnDate', () => {
    it('returns false if startDateTime is invalid', () => {
      const habit = { startDateTime: 'invalid-date', habitFrequency: 1 };
      expect(DailyCalendar.isHabitActiveOnDate(habit, new Date())).toBe(false);
    });

    it('returns false if target date is before start date', () => {
      const habit = { startDateTime: '2025-06-10', habitFrequency: 1 };
      const date = new Date('2025-06-09');
      expect(DailyCalendar.isHabitActiveOnDate(habit, date)).toBe(false);
    });

    it('returns true if date aligns with frequency', () => {
      const habit = { startDateTime: '2025-06-01', habitFrequency: 2 };
      const date = new Date('2025-06-05'); // 4 days later, 4 % 2 === 0
      expect(DailyCalendar.isHabitActiveOnDate(habit, date)).toBe(true);
    });

    it('returns false if date does not align with frequency', () => {
      const habit = { startDateTime: '2025-06-01', habitFrequency: 3 };
      const date = new Date('2025-06-05'); // 4 days later, 4 % 3 !== 0
      expect(DailyCalendar.isHabitActiveOnDate(habit, date)).toBe(false);
    });
  });

  describe('getHabitsForDate', () => {
    it('returns an empty array if getAllHabits returns undefined', () => {
      getAllHabits.mockReturnValue(undefined);
      const result = DailyCalendar.getHabitsForDate(new Date());
      expect(result).toEqual([]);
    });

    it('returns only active habits on the specified date', () => {
      const date = new Date('2025-06-05');
      getAllHabits.mockReturnValue(
        new Map([
          ['habit1', { startDateTime: '2025-06-01', habitFrequency: 2 }],
          ['habit2', { startDateTime: '2025-06-01', habitFrequency: 3 }],
        ])
      );

      const result = DailyCalendar.getHabitsForDate(date);
      expect(result).toEqual([['habit1', expect.any(Object)]]);
    });
  });

  describe('navigateCalendar', () => {
    it('advances the date forward correctly', () => {
      const original = DailyCalendar.getCurrentDate();
      DailyCalendar.navigateCalendar(2);
      const updated = DailyCalendar.getCurrentDate();
      expect(updated.getDate()).toBe(original.getDate() + 2);
    });

    it('rewinds the date correctly', () => {
      const original = DailyCalendar.getCurrentDate();
      DailyCalendar.navigateCalendar(-1);
      const updated = DailyCalendar.getCurrentDate();
      expect(updated.getDate()).toBe(original.getDate() - 1);
    });
  });

  describe('getCurrentDate', () => {
    it('returns a new Date object each time', () => {
      const date1 = DailyCalendar.getCurrentDate();
      const date2 = DailyCalendar.getCurrentDate();
      expect(date1).not.toBe(date2);
      expect(date1.getTime()).toBe(date2.getTime());
    });
  });

  describe('updateHabitsForDays', () => {
    it('renders habit dots for all 3 containers', () => {
      const today = new Date();
      getAllHabits.mockReturnValue(
        new Map([
          ['habit1', {
            habitName: 'Water',
            startDateTime: today.toISOString(),
            habitFrequency: 1,
          }],
        ])
      );
      isHabitComplete.mockReturnValue(true);

      DailyCalendar.updateHabitsForDays();

      expect(document.getElementById('prev-habits').children.length).toBeGreaterThan(0);
      expect(document.getElementById('current-habits').children.length).toBeGreaterThan(0);
      expect(document.getElementById('next-habits').children.length).toBeGreaterThan(0);
    });
  });
});
