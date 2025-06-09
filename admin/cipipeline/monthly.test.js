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
  window.initNavigation = calendarModule.initNavigation;
});

describe('Basic Monthly Calendar Structure', () => {
  beforeEach(() => {
    document.getElementById('calendar').innerHTML = '';
    document.getElementById('month-label').textContent = '';
    generateCalendar(2024);
  });

  test('Renders 12 months', () => {
    const months = document.querySelectorAll('.month');
    expect(months.length).toBe(12);
  });

  test('Each month has a label and a calendar grid', () => {
    const months = document.querySelectorAll('.month');
    months.forEach((monthDiv) => {
      const label = monthDiv.querySelector('.month-label');
      const grid = monthDiv.querySelector('.calendar-grid');
      expect(label).not.toBeNull();
      expect(grid).not.toBeNull();
    });
  });

  test('Renders correct year label', () => {
    const label = document.getElementById('month-label');
    expect(label.textContent).toBe('2024');
  });
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

describe('Navigation Menu', () => {
  beforeAll(() => {
    initNavigation();
  });
  beforeEach(() => {
    // Reset location for each test
    delete window.location;
    window.location = { href: '' };
  });

  test('Navigates to home-page.html', () => {
    document.getElementById('home-selection').click();
    expect(window.location.href).toBe('home-page.html');
  });

  test('Navigates to daily-calendar.html', () => {
    document.getElementById('calendar-selection').click();
    document.getElementById('daily-option').click();
    expect(window.location.href).toBe('daily-calendar.html');
  });

  test('Navigates to monthly-calendar.html', () => {
    document.getElementById('calendar-selection').click();
    document.getElementById('monthly-option').click();
    expect(window.location.href).toBe('monthly-calendar.html');
  });

  test('Navigates to settings.html', () => {
    document.getElementById('settings-selection').click();
    expect(window.location.href).toBe('settings.html');
  });
});
