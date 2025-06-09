/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';

// Mock CRUD module used in daily-calander.js
jest.unstable_mockModule('../../out/scripts/CRUD.js', () => ({
  getHabitsForDay: jest.fn(),
  isHabitComplete: jest.fn(),
  logHabitCompleted: jest.fn(),
  removeHabitCompletion: jest.fn(),
}));

// Load mocked CRUD and daily calendar module
const { getHabitsForDay, isHabitComplete } = await import(
  '../../out/scripts/CRUD.js'
);
await import('../../out/scripts/daily-calendar.js');
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
      <div class="calendar-container"></div>
    `;
    window.currentDate = new Date('2025-06-05T12:00:00'); // Consistent test date
    jest.clearAllMocks();
  });

  describe('navigateCalendar', () => {
    it('moves forward by days', () => {
      const start = DailyCalendar.getCurrentDate();
      DailyCalendar.navigateCalendar(3);
      const updated = DailyCalendar.getCurrentDate();
      expect(updated.getDate()).toBe(start.getDate() + 3);
    });

    it('moves backward by days', () => {
      const start = DailyCalendar.getCurrentDate();
      DailyCalendar.navigateCalendar(-2);
      const updated = DailyCalendar.getCurrentDate();
      expect(updated.getDate()).toBe(start.getDate() - 2);
    });
  });

  describe('getCurrentDate', () => {
    it('returns a copy of the currentDate', () => {
      const d1 = DailyCalendar.getCurrentDate();
      const d2 = DailyCalendar.getCurrentDate();
      expect(d1).not.toBe(d2);
      expect(d1.getTime()).toBe(d2.getTime());
    });
  });

  describe('fillCard', () => {
    it('fills in day name and date correctly', () => {
      const card = document.createElement('div');
      card.id = 'test-card';
      card.innerHTML = `
        <div class="day-name"></div>
        <div class="day-date"></div>
      `;
      document.body.appendChild(card);

      const date = new Date('2025-06-05T12:00:00');
      DailyCalendar.fillCard('test-card', date);

      expect(card.querySelector('.day-name').textContent).toBe('Thursday');
      expect(card.querySelector('.day-date').textContent).toBe('Jun 5');
    });
  });

  describe('updateHabitIndicators', () => {
    it('shows no dots when no habits are returned', () => {
      const date = new Date('2025-06-05');
      const container = document.createElement('div');
      container.id = 'habit-container';
      document.body.appendChild(container);

      getHabitsForDay.mockReturnValue([]);
      DailyCalendar.updateHabitIndicators('habit-container', date);

      expect(container.querySelectorAll('.habit-dot').length).toBe(0);
    });

    it('renders completed and pending habit dots', () => {
      const date = new Date('2025-06-05');
      const container = document.createElement('div');
      container.id = 'habit-container';
      document.body.appendChild(container);

      getHabitsForDay.mockReturnValue([
        [
          'habit1',
          {
            habitName: 'Hydrate',
            startDateTime: date.toISOString(),
            habitFrequency: 1,
          },
        ],
        [
          'habit2',
          {
            habitName: 'Exercise',
            startDateTime: date.toISOString(),
            habitFrequency: 1,
          },
        ],
      ]);
      isHabitComplete.mockReturnValueOnce(true).mockReturnValueOnce(false);

      DailyCalendar.updateHabitIndicators('habit-container', date);

      const dots = container.querySelectorAll('.habit-dot');
      expect(dots.length).toBe(2);
      expect(dots[0].classList.contains('completed')).toBe(true);
      expect(dots[1].classList.contains('pending')).toBe(true);
    });
  });

  describe('updateHabitsForDays', () => {
    it('renders dots in all 3 containers', () => {
      getHabitsForDay.mockReturnValue([
        [
          'habit1',
          {
            habitName: 'Test Habit',
            startDateTime: '2025-06-01T08:00:00',
            habitFrequency: 1,
          },
        ],
      ]);
      isHabitComplete.mockReturnValue(true);

      DailyCalendar.updateHabitsForDays();

      expect(
        document.getElementById('prev-habits').children.length,
      ).toBeGreaterThan(0);
      expect(
        document.getElementById('current-habits').children.length,
      ).toBeGreaterThan(0);
      expect(
        document.getElementById('next-habits').children.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('showDetailedView', () => {
    it('renders overlay with a close button and no habits message', () => {
      getHabitsForDay.mockReturnValue([]);
      isHabitComplete.mockReturnValue(false);

      DailyCalendar.showDetailedView();

      const overlay = document.getElementById('habit-detail-overlay');
      expect(overlay).toBeTruthy();

      const closeButton = overlay.querySelector('button');
      expect(closeButton).toBeTruthy();
      expect(closeButton.textContent).toMatch(/✕ Close/);
    });
  });

  describe('closeDetailedView', () => {
    it('removes overlay and restores calendar', () => {
      getHabitsForDay.mockReturnValue([]);
      DailyCalendar.showDetailedView();

      expect(document.getElementById('habit-detail-overlay')).toBeTruthy();

      DailyCalendar.closeDetailedView();
      expect(document.getElementById('habit-detail-overlay')).toBeNull();
      expect(document.querySelector('.calendar-container').style.display).toBe(
        'flex',
      );
    });
  });
});
