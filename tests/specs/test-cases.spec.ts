import { createUser } from "../utils/user.factory";
import { MenuLinks } from "../enums/menu-links.enum";
import { test } from "../fixtures";

test('Test Case 1: Register User', async ({ homePage, loginPage, signupPage, accountCreatedPage, accountDeletedPage }) => {
  const userData = createUser();

  await homePage.navigate();
  await homePage.expectHeader();
  await homePage.menuClick(MenuLinks.SIGNUP_LOGIN);
  await loginPage.expectSignupForm();
  await loginPage.fillSignupForm(userData.name, userData.email);
  await loginPage.signupSubmit();
  await signupPage.expectRegisterForm();
  await signupPage.fillRegisterForm(userData);
  await signupPage.submitRegisterForm();
  await accountCreatedPage.expectAccountCreated();
  await accountCreatedPage.continueToHome();
  await homePage.checkLoggedIn(userData.name);
  await homePage.menuClick(MenuLinks.DELETE_ACCOUNT);
  await accountDeletedPage.expectAccountDeleted();
  await accountDeletedPage.continueToHome();
  await homePage.checkLoggedOut();
  await homePage.expectHeader();
});

test('Test Case 2: Login User with correct email and password', async ({ homePage, loginPage, accountApi, accountDeletedPage }) => {
  const userData = createUser();

  await accountApi.createAccount(userData);
  await homePage.navigate();
  await homePage.checkLoggedOut();
  await homePage.menuClick(MenuLinks.SIGNUP_LOGIN);
  await loginPage.expectLoginForm();
  await loginPage.fillLoginForm(userData.email, userData.password);
  await loginPage.loginSubmit();
  await homePage.checkLoggedIn(userData.name);
  await homePage.menuClick(MenuLinks.DELETE_ACCOUNT);
  await accountDeletedPage.expectAccountDeleted();
});

test('Test Case 3: Login User with incorrect email and password', async ({ homePage, loginPage }) => {
  const UserData = createUser();

  await homePage.navigate();
  await homePage.expectHeader();
  await homePage.menuClick(MenuLinks.SIGNUP_LOGIN);
  await loginPage.expectLoginForm();

  await loginPage.fillLoginForm(UserData.email, UserData.password);
  await loginPage.loginSubmit();
  await loginPage.expectLoginError();
  await homePage.checkLoggedOut();
});

test('Test Case 4: Logout User', async ({ homePage, loginPage, accountApi }) => {
  const UserData = createUser();

  await accountApi.createAccount(UserData);
  await homePage.navigate();
  await homePage.menuClick(MenuLinks.SIGNUP_LOGIN);
  await loginPage.expectLoginForm();
  await loginPage.fillLoginForm(UserData.email, UserData.password);
  await loginPage.loginSubmit();
  await homePage.checkLoggedIn(UserData.name);
  await homePage.menuClick(MenuLinks.LOGOUT);
  await homePage.checkLoggedOut();
  await accountApi.deleteAccount(UserData.email, UserData.password);
});

test('Test Case 5: Register User with existing email', async ({ homePage, loginPage, accountApi }) => {
  const UserData = createUser();

  await accountApi.createAccount(UserData);

  await homePage.navigate();
  await homePage.expectHeader();
  await homePage.menuClick(MenuLinks.SIGNUP_LOGIN);
  await loginPage.expectSignupForm();

  await loginPage.fillSignupForm(UserData.name, UserData.email);
  await loginPage.signupSubmit();
  await loginPage.expectSignupError();
  await homePage.checkLoggedOut();

  await accountApi.deleteAccount(UserData.email, UserData.password);
});


