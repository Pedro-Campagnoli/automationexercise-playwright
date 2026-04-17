import { expect, Page } from '@playwright/test';
import { UserDataProps } from '../utils/user.factory';

export async function createAccount(page: Page, user: UserDataProps) {
  await page.goto('/');
  await page.getByRole('link', { name: 'Signup / Login' }).click();
  await expect(page.getByRole('heading', { name: 'New User Signup!' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Name' }).fill(user.name);
  await page.locator('form').filter({ hasText: 'Signup' }).getByPlaceholder('Email Address').fill(user.email);

  await Promise.all([
    page.getByRole('button', { name: 'Signup' }).click(),
  ]);

  await page.getByRole('radio', { name: user.title }).check();

  await page.getByRole('textbox', { name: 'Password *' }).fill(user.password);
  await page.locator('#days').selectOption(user.day);
  await page.locator('#months').selectOption(user.month);
  await page.locator('#years').selectOption(user.year);

  if (user.newsletter) {
    await page.getByRole('checkbox', { name: 'Sign up for our newsletter!' }).check();
  }
  if (user.specialOffers) {
    await page.getByRole('checkbox', { name: 'Receive special offers from' }).check();
  }

  await page.getByRole('textbox', { name: 'First name *' }).fill(user.firstName);
  await page.getByRole('textbox', { name: 'Last name *' }).fill(user.lastName);
  await page.getByRole('textbox', { name: 'Company', exact: true }).fill(user.company);
  await page.getByRole('textbox', { name: 'Address * (Street address, P.' }).fill(user.address);
  await page.getByRole('textbox', { name: 'Address 2' }).fill(user.address2);
  await page.getByLabel('Country *').selectOption(user.country);
  await page.getByRole('textbox', { name: 'State *' }).fill(user.state);
  await page.locator('#city').fill(user.city);
  await page.locator('#zipcode').fill(user.zipcode);
  await page.getByRole('textbox', { name: 'Mobile Number *' }).fill(user.mobile);

  await Promise.all([
    page.getByRole('button', { name: 'Create Account' }).click(),
  ]);

  await expect(page.getByText('Account Created!')).toBeVisible();
  await page.getByRole('link', { name: 'Continue' }).click();
}

export async function registerWithExistingEmail(page: Page, name: string, email: string) {
  await page.getByRole('link', { name: 'Signup / Login' }).click();
  await expect(page.getByRole('heading', { name: 'New User Signup!' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Name' }).fill(name);
  await page.locator('form').filter({ hasText: 'Signup' }).getByPlaceholder('Email Address').fill(email);
  await page.getByRole('button', { name: 'Signup' }).click();

  await expect(page.getByText('Email Address already exist!')).toBeVisible();
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.getByRole('link', { name: 'Signup / Login' }).click();
  await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

  await page.locator('form').filter({ hasText: 'Login' }).getByPlaceholder('Email Address').fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);

  await Promise.all([
    page.getByRole('button', { name: 'Login' }).click(),
  ]);

  await expect(page.getByText('Logged in as')).toBeVisible();
}

export async function loginWithInvalidCredentials(page: Page, email: string, password: string) {
  await page.getByRole('link', { name: 'Signup / Login' }).click();
  await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

  await page.locator('form').filter({ hasText: 'Login' }).getByPlaceholder('Email Address').fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Your email or password is incorrect!')).toBeVisible();
}

export async function logout(page: Page) {
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
}

export async function deleteAccount(page: Page) {
  await expect(page.getByText('Logged in as')).toBeVisible();

  await Promise.all([
    page.getByRole('link', { name: 'Delete Account' }).click(),
  ]);

  await expect(page.getByText('Account Deleted!')).toBeVisible();
  await page.getByRole('link', { name: 'Continue' }).click();
}