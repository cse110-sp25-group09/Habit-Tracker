/**
 * @jest-environment jsdom
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Emulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

beforeAll(async () => {
  const html = readFileSync(resolve(__dirname, '../home-page.html'), 'utf8');
  document.body.innerHTML = html;

  // Dynamically import the script so it works with ESM
  await import('../../out/scripts/home.js');
});

describe('HabitCard component', () => {
  test('renders name in shadow DOM', () => {
    const el = document.createElement('habit-card');
    el.setAttribute('card-name', 'Read');
    document.body.appendChild(el);

    const shadowTitle = el.shadowRoot.getElementById('card_name');
    expect(shadowTitle.textContent).toBe('Read');
  });

  test('renders streak number with orange class', () => {
    const el = document.createElement('habit-card');
    el.setAttribute('card-streak', '5');
    document.body.appendChild(el);

    const streak = el.shadowRoot.getElementById('card_streak');
    expect(streak.querySelector('.streak_number').textContent.trim()).toBe('5');
  });
});
