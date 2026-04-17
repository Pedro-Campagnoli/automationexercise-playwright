import { test } from '@playwright/test';
import { createAccount, deleteAccount, login, loginWithInvalidCredentials, logout, registerWithExistingEmail } from '../helpers/account.helper';
import { createUser } from '../utils/user.factory';

const UserData = createUser();

test('Test Case 1: Register User', async ({ page }) => {
  await createAccount(page, UserData);
  await deleteAccount(page);
});

test('Test Case 2: Login User with correct email and password', async ({ page }) => {
  await createAccount(page, UserData);
  await logout(page);
  await login(page, UserData.email, UserData.password);
  await deleteAccount(page);
})

test('Test Case 3: Login User with incorrect email and password', async ({ page }) => {
  await loginWithInvalidCredentials(page, 'test@gmail.com', '123122');
})

test('Test Case 4: Logout User', async ({ page }) => {
  await createAccount(page, UserData);
  await logout(page);
  await login(page, UserData.email, UserData.password);
  await deleteAccount(page);
})

test('Test Case 5: Register User with existing email', async ({ page }) => {
  await createAccount(page, UserData);
  await logout(page);
  await registerWithExistingEmail(page, UserData.name, UserData.email);
  await login(page, UserData.email, UserData.password);
  await deleteAccount(page);
});