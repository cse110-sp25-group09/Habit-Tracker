import {
  createCard,
  localStorageAdapter,
} from '../../out/scripts/createCard.js';

let page, browser;
let url = '../../localstorage.html';

describe('Create a card data object in localStorage or a database', () => {
  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto(url);
    localStorage.clear();
  });

  it('Check for card data in localStorage', async () => {
    let testCall1 = createCard(
      'Drink Water',
      'Fill glass, lift to mouth and swallow',
      24,
      'Sun May 25 2025 13:04:28 GMT-0700 (Pacific Daylight Time)',
      localStorageAdapter,
    );
    const cardData = localStorage.getItem(testCall1);
    const cardDataRef = {
      habitName: 'Drink Water',
      habitDescription: 'Fill glass, lift to mouth and swallow',
      habitFrequency: '24',
      startDateTime:
        'Sun May 25 2025 13:04:28 GMT-0700 (Pacific Daylight Time)',
      habitStreak: '0',
    };
    expect(JSON.parse(cardData)).toBe(cardDataRef);
  });
});
