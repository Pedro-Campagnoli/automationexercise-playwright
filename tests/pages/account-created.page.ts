import { expect, type Locator, type Page } from "@playwright/test";
export class AccountCreatedPage {
  protected readonly path = "/account_created";

  readonly page: Page;
  readonly accountCreatedHeading: Locator;
  readonly continueButton: Locator

  constructor(page: Page) {

    this.page = page;

    this.accountCreatedHeading = page.getByRole('heading', { name: 'Account Created!' });
    this.continueButton = page.getByRole('link', { name: 'Continue' });
  }

  async expectAccountCreated(){
    await expect(this.page).toHaveURL(this.path);
    await expect(this.accountCreatedHeading).toBeVisible();
    // toHaveCSS compara o valor computado, que o browser sempre devolve como rgb()
  }

  async continueToHome() {
    await this.continueButton.click();
  }
}