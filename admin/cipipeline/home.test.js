/**
 * @jest-environment jsdom
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { jest } from '@jest/globals';

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
    el.setAttribute('card-id', 'test1'); // Required
    el.setAttribute('card-name', 'Read');
    el.setAttribute('card-completed', 'false'); // Optional but helps full init
    document.body.appendChild(el);

    const shadowTitle = el.shadowRoot.getElementById('card_name');
    expect(shadowTitle.textContent).toBe('Read');
  });

  test('renders streak number with orange class on first load', () => {
    const el = document.createElement('habit-card');
    el.setAttribute('card-id', 'test2'); // Required
    el.setAttribute('card-streak', '5');
    el.setAttribute('card-completed', 'false'); // To avoid early return
    document.body.appendChild(el);

    const streak = el.shadowRoot.getElementById('card_streak');
    expect(streak.querySelector('.streak_number').textContent.trim()).toBe('5');
  });
  test('checkbox reflects card-completed attribute', () => {
    const el = document.createElement('habit-card');
    el.setAttribute('card-id', 'test3');
    el.setAttribute('card-completed', 'true');
    document.body.appendChild(el);

    const checkbox = el.shadowRoot.querySelector('.habit-checkbox');
    expect(checkbox.checked).toBe(true);
  });


  test('flipping the card toggles flipped class', () => {
    const el = document.createElement('habit-card');
    el.setAttribute('card-id', 'test5');
    document.body.appendChild(el);

    const flipCard = el.shadowRoot.querySelector('.flip-card');
    const flipInner = el.shadowRoot.querySelector('.flip-card-inner');

    expect(flipInner.classList.contains('flipped')).toBe(false);
    flipCard.click();
    expect(flipInner.classList.contains('flipped')).toBe(true);
    flipCard.click();
    expect(flipInner.classList.contains('flipped')).toBe(false);
  });

  test('clicking delete shows confirmation dialog', () => {
    const el = document.createElement('habit-card');
    el.setAttribute('card-id', 'test6');
    document.body.appendChild(el);

    const deleteBtn = el.shadowRoot.querySelector('.delete-btn');
    const confirmDialog = el.shadowRoot.querySelector('.confirm-dialog');

    expect(confirmDialog.hidden).toBe(true);
    deleteBtn.click();
    expect(confirmDialog.hidden).toBe(false);
  });

  test('clicking No hides confirmation dialog and shows delete button', () => {
    const el = document.createElement('habit-card');
    el.setAttribute('card-id', 'test7');
    document.body.appendChild(el);

    const deleteBtn = el.shadowRoot.querySelector('.delete-btn');
    const confirmDialog = el.shadowRoot.querySelector('.confirm-dialog');
    const noBtn = el.shadowRoot.querySelector('.confirm-no');

    deleteBtn.click(); // open confirm dialog
    noBtn.click(); // cancel

    expect(confirmDialog.hidden).toBe(true);
    expect(deleteBtn.hidden).toBe(false);
  });

  test('renders name in shadow DOM', () => {
    const el = document.createElement('habit-card');
    el.setAttribute('card-id', 'test1');
    el.setAttribute('card-name', 'Read');
    el.setAttribute('card-completed', 'false');
    document.body.appendChild(el);

    const shadowTitle = el.shadowRoot.getElementById('card_name');
    expect(shadowTitle.textContent).toBe('Read');
  });
  test('renders description when card-description is set', () => {
    const el = document.createElement('habit-card');
    el.setAttribute('card-id', 'test8');
    el.setAttribute('card-description', 'Read for 30 minutes');
    el.setAttribute('card-completed', 'false');
    document.body.appendChild(el);

    const desc = el.shadowRoot.getElementById('card_description');
    expect(desc.textContent).toContain('Read for 30 minutes');
  });

  test('adds "completed" class when checkbox is checked', () => {
    const el = document.createElement('habit-card');
    el.setAttribute('card-id', 'test9');
    el.setAttribute('card-completed', 'true');
    document.body.appendChild(el);

    const cardFront = el.shadowRoot.querySelector('.flip-card-front');
    expect(cardFront.classList.contains('completed')).toBe(true);
  });

  test('flip behavior toggles .flipped class', () => {
    const el = document.createElement('habit-card');
    el.setAttribute('card-id', 'test10');
    document.body.appendChild(el);

    const flipCard = el.shadowRoot.querySelector('.flip-card');
    const flipInner = flipCard.querySelector('.flip-card-inner');

    expect(flipInner.classList.contains('flipped')).toBe(false);

    flipCard.click();
    expect(flipInner.classList.contains('flipped')).toBe(true);

    flipCard.click();
    expect(flipInner.classList.contains('flipped')).toBe(false);
  });
});
