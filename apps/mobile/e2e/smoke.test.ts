import { device, expect as detoxExpect, element, by } from 'detox';

describe('Smoke — app launch', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('should launch without crashing', async () => {
    // TODO(human): What should we verify is visible right after launch?
    // The app has just started from a clean state (no library configured yet).
    // Add 1-3 detoxExpect() assertions that confirm the initial screen is ready.
    // e.g. detoxExpect(element(by.id('...'))).toBeVisible()
  });

  it('should display the bottom tab bar', async () => {
    await detoxExpect(element(by.id('bottom-tab-bar'))).toBeVisible();
  });
});
