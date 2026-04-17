import { expect, Page } from '@playwright/test';

export interface UserDataProps {
  name: string;
  email: string;
  password: string;
  title: string;
  day: string;
  month: string;
  year: string;
  newsletter: boolean;
  specialOffers: boolean;
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobile: string;
}

export async function createAccount(page: Page, user: UserDataProps) {
  await page.goto('/');
    await page.getByRole('link', { name: 'Signup / Login' }).click();
  
    await expect(
      page.getByRole('heading', { name: 'New User Signup!' })
      ).toBeVisible();
    await page.getByRole('textbox', { name: 'Name' }).fill(user.name);
    await page.locator('form').filter({ hasText: 'Signup' }).getByPlaceholder('Email Address').fill(user.email);
    await page.getByRole('button', { name: 'Signup' }).click();
  
    if(user.title === 'Mr.') {
      await page.getByRole('radio', { name: 'Mr.' }).check();
    }else if(user.title === 'Mrs.') {
      await page.getByRole('radio', { name: 'Mrs.' }).check();
    }
  
    await page.getByRole('textbox', { name: 'Password *' }).fill(user.password);
    await page.locator('#days').selectOption(user.day);
    await page.locator('#months').selectOption(user.month);
    await page.locator('#years').selectOption(user.year);
  
    if(user.newsletter) {
      await page.getByRole('checkbox', { name: 'Sign up for our newsletter!' }).check();   
    }
    if(user.specialOffers) {
      await page.getByRole('checkbox', { name: 'Receive special offers from' }).check();
    }
  
    await page.getByRole('textbox', { name: 'First name *' }).fill(user.firstName);
    await page.getByRole('textbox', { name: 'Last name *' }).fill(user.lastName);
    await page.getByRole('textbox', { name: 'Company', exact: true }).fill(user.company);
    await page.getByRole('textbox', { name: 'Address * (Street address, P.' }).fill(user.address);
    await page.getByRole('textbox', { name: 'Address 2' }).fill(user.address2);
    await page.getByLabel('Country *').selectOption(user.country);
    await page.getByRole('textbox', { name: 'State *' }).fill(user.state);
    await page.getByRole('textbox', { name: 'City * Zipcode *' }).fill(user.city);
    await page.locator('#zipcode').fill(user.zipcode);
    await page.getByRole('textbox', { name: 'Mobile Number *' }).fill(user.mobile);
    await page.getByRole('button', { name: 'Create Account' }).click();
  
    await expect(page.getByText('Account Created!')).toBeVisible();
    await page.getByRole('link', { name: 'Continue' }).click();
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.getByRole('link', { name: 'Signup / Login' }).click();

  await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

  await page
    .locator('form')
    .filter({ hasText: 'Login' })
    .getByPlaceholder('Email Address')
    .fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Logged in as')).toBeVisible();
}

export async function loginWithInvalidCredentials(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.getByRole('link', { name: 'Signup / Login' }).click();

  await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

  await page
    .locator('form')
    .filter({ hasText: 'Login' })
    .getByPlaceholder('Email Address')
    .fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Your email or password is incorrect!')).toBeVisible();
}

export async function logout(page: Page) {
  await page.goto('/');
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
}

export async function deleteAccount(page: Page) {
  await page.goto('/');
  await expect(page.getByText('Logged in as')).toBeVisible();
  
  await page.getByRole('link', { name: 'Delete Account' }).click();
  await expect(page.getByText('Account Deleted!')).toBeVisible();
  await page.getByRole('link', { name: 'Continue' }).click();
}