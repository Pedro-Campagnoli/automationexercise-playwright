import { test as base } from "@playwright/test";
import { AccountApi } from "./api";
import { AccountCreatedPage, AccountDeletedPage, HomePage, LoginPage, SignupPage } from "./pages";


type Fixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  signupPage: SignupPage;
  accountApi: AccountApi;
  accountCreatedPage: AccountCreatedPage;
  accountDeletedPage: AccountDeletedPage;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },

  accountApi: async ({ request }, use) => {
    await use(new AccountApi(request));
  },

  accountCreatedPage: async ({ page }, use) => {
    await use(new AccountCreatedPage(page));
  },

  accountDeletedPage: async ({ page }, use) => {
    await use(new AccountDeletedPage(page));
  },
});

export { expect } from "@playwright/test";
