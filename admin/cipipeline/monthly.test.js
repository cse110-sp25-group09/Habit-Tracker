/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

beforeAll(async () => {
  const html = readFileSync(
    resolve(__dirname, '../monthly-calendar.html'),
    'utf8',
  );
  document.body.innerHTML = html;

  // Load script and get the exported functions
  const calendarModule = await import('../../out/scripts/monthly-calendar.js');

  // Attach functions to window for testing
  window.generateCalendar = calendarModule.generateCalendar;
  window.updateDayCompletion = calendarModule.updateDayCompletion;
});

describe('Leap Year Handling and Day Class Application', () => {
  beforeEach(() => {
    // Clear and regenerate calendar for each test
    document.getElementById('calendar').innerHTML = '';
    window.generateCalendar(2024);
  });

  test('Leap year February has 29 days', () => {
    const calendar = document.getElementById('calendar');
    const monthDivs = calendar.querySelectorAll('.month');
    const februaryMonth = Array.from(monthDivs).find((monthDiv) =>
      monthDiv.querySelector('.month-label')?.textContent.includes('February'),
    );

    expect(februaryMonth).toBeDefined();
    const days = februaryMonth.querySelectorAll('.day:not(.inactive)');
    expect(days.length).toBe(29);
  });

  test('Class changes with 100% completion', () => {
    const el = document.createElement('div');
    el.classList.add('day');
    window.updateDayCompletion(el, 5, 5);
    expect(el.classList.contains('completed-day')).toBe(true);
  });

  test('Class changes with 50% completion', () => {
    const el = document.createElement('div');
    el.classList.add('day');
    window.updateDayCompletion(el, 1, 2);
    expect(el.classList.contains('completed-half')).toBe(true);
  });

  test('Class changes with <50% completion', () => {
    const el = document.createElement('div');
    el.classList.add('day');
    window.updateDayCompletion(el, 1, 3);
    expect(el.classList.contains('completed-one')).toBe(true);
  });
});
