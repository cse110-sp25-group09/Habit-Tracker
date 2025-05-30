/**
 * @jest-environment jsdom
 */

import {
  generateCalendar,
  setupEventListeners,
  monthNames,
} from '../monthly-calendar';

describe('generateCalendar', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="calendar"></div>
      <div id="month-label"></div>
      <button id="prev-year"></button>
      <button id="next-year"></button>
    `;

    generateCalendar(2025);
  });

  test('correct year', () => {
    expect(document.getElementById('month-label').textContent).toBe('2025');
  });

  test('creates containers for 12 months', () => {
    const months = document.querySelectorAll('.month');
    expect(months.length).toBe(12);
  });

  test('each month has a label with correct format', () => {
    const monthLabels = Array.from(
      document.querySelectorAll('.month .month-label'),
    );
    for (let i = 0; i < monthLabels; i++) {
      expect(monthLabels[i].textContent).toBe(`${monthNames[i]} 2025`);
    }
  });

  test('each calendar grid starts with 7 day headers', () => {
    const dayHeaders = document
      .querySelector('.month .calendar-grid')
      .querySelectorAll('.day-header');
    expect(dayHeaders.length).toBe(7);
    expect(Array.from(dayHeaders).map((el) => el.textContent)).toEqual([
      'Su',
      'Mo',
      'Tu',
      'We',
      'Th',
      'Fr',
      'Sa',
    ]);
  });
});
