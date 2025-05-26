/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
beforeAll(() => {
  const html = fs.readFileSync(
    path.resolve(__dirname, '../home-page.html'),
    'utf8',
  );

  document.body.innerHTML = html;

  require('../../out/scripts/home.js');
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
