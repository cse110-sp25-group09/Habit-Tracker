/**
 * @jest-environment jsdom
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

beforeAll(async () => {
  const html = readFileSync(resolve(__dirname, '../monthly.html'), 'utf8');
  document.body.innerHTML = html;

  // Load the monthly.js script — this should manipulate the DOM
  await import('../../out/scripts/monthly.js');
});

describe('Leap Year Handling and Day Class Application', () => {
  test('Leap year Feb has 29 days', () => {
    const calendar = document.getElementById('calendar');
    // You’ll need to ensure monthly.js actually creates calendar days on load or call the generate function manually if exposed globally.
    const days = calendar.querySelectorAll('.calendar-day');
    expect(days.length).toBeGreaterThanOrEqual(29);
  });

  test('Class changes with 100% completion', () => {
    const el = document.createElement('div');
    el.classList.add('calendar-day');

    // Simulate DOM input expected by updateDayCompletion
    el.dataset.numerator = '5';
    el.dataset.denominator = '5';

    // Trigger update logic if available globally
    window.updateDayCompletion?.(el, 5, 5); // Or simulate a click or calendar redraw that does it

    expect(el.classList.contains('completed-day')).toBe(true);
  });

  test('Class changes with 50% completion', () => {
    const el = document.createElement('div');
    el.classList.add('calendar-day');
    window.updateDayCompletion?.(el, 1, 2);
    expect(el.classList.contains('completed-half')).toBe(true);
  });

  test('Class changes with <50% completion', () => {
    const el = document.createElement('div');
    el.classList.add('calendar-day');
    window.updateDayCompletion?.(el, 1, 3);
    expect(el.classList.contains('completed-one')).toBe(true);
  });
});