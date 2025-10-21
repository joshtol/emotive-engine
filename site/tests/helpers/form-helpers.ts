import { Page, Locator } from '@playwright/test';

/**
 * Helper utilities for testing form functionality
 */

export interface WaitlistFormElements {
  emailInput: Locator;
  submitButton: Locator;
  messageDiv: Locator | null;
}

/**
 * Get all waitlist form elements
 * @param page - Playwright page instance
 * @returns Object containing form element locators
 */
export function getWaitlistFormElements(page: Page): WaitlistFormElements {
  return {
    emailInput: page.locator('input[type="email"]'),
    submitButton: page.locator('button[type="submit"]').filter({ hasText: /Get Notified|Joining|Joined/i }),
    messageDiv: null // Will be populated after form submission
  };
}

/**
 * Submit waitlist form with email
 * @param page - Playwright page instance
 * @param email - Email address to submit
 */
export async function submitWaitlistForm(page: Page, email: string): Promise<void> {
  const { emailInput, submitButton } = getWaitlistFormElements(page);

  await emailInput.fill(email);
  await submitButton.click();
}

/**
 * Get current form status
 * @param page - Playwright page instance
 * @returns Current form status (idle, loading, success, error)
 */
export async function getFormStatus(page: Page): Promise<string> {
  const { submitButton } = getWaitlistFormElements(page);
  const buttonText = await submitButton.textContent();

  if (!buttonText) return 'unknown';

  if (buttonText.includes('Joining')) return 'loading';
  if (buttonText.includes('Joined')) return 'success';
  if (buttonText.includes('Get Notified')) return 'idle';

  return 'unknown';
}

/**
 * Wait for form status to change
 * @param page - Playwright page instance
 * @param targetStatus - Status to wait for
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 */
export async function waitForFormStatus(
  page: Page,
  targetStatus: 'idle' | 'loading' | 'success' | 'error',
  timeout = 5000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const currentStatus = await getFormStatus(page);
    if (currentStatus === targetStatus) return;

    await page.waitForTimeout(100);
  }

  throw new Error(`Form status did not change to ${targetStatus} within ${timeout}ms`);
}

/**
 * Get form validation message
 * @param page - Playwright page instance
 * @returns Validation message text or null
 */
export async function getFormMessage(page: Page): Promise<string | null> {
  // Look for message div that appears after submission
  const messageDiv = page.locator('div').filter({
    hasText: /waitlist|success|error|email|valid/i
  }).last();

  const isVisible = await messageDiv.isVisible().catch(() => false);

  if (!isVisible) return null;

  return await messageDiv.textContent();
}

/**
 * Check if form is disabled
 * @param page - Playwright page instance
 * @returns True if form inputs are disabled
 */
export async function isFormDisabled(page: Page): Promise<boolean> {
  const { emailInput, submitButton } = getWaitlistFormElements(page);

  const emailDisabled = await emailInput.isDisabled().catch(() => false);
  const buttonDisabled = await submitButton.isDisabled().catch(() => false);

  return emailDisabled || buttonDisabled;
}

/**
 * Generate a unique test email
 * @param prefix - Email prefix (default: 'test')
 * @returns Unique email address
 */
export function generateTestEmail(prefix = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}${timestamp}${random}@example.com`;
}

/**
 * Wait for form to reset to idle state
 * @param page - Playwright page instance
 * @param timeout - Maximum time to wait in milliseconds (default: 6000)
 */
export async function waitForFormReset(page: Page, timeout = 6000): Promise<void> {
  await waitForFormStatus(page, 'idle', timeout);
}

/**
 * Check if email input has valid value
 * @param page - Playwright page instance
 * @returns True if email input has a value
 */
export async function hasEmailValue(page: Page): Promise<boolean> {
  const { emailInput } = getWaitlistFormElements(page);
  const value = await emailInput.inputValue();
  return value.length > 0;
}

/**
 * Clear form inputs
 * @param page - Playwright page instance
 */
export async function clearForm(page: Page): Promise<void> {
  const { emailInput } = getWaitlistFormElements(page);
  await emailInput.clear();
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if email format is valid
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
