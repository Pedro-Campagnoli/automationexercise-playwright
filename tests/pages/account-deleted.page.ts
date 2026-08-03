import { expect, type Locator, type Page } from "@playwright/test";
export class AccountDeletedPage {
  protected readonly path = "/delete_account";

  readonly page: Page;
  readonly deletedHeading: Locator;
  readonly continueButton: Locator

  constructor(page: Page) {

    this.page = page;

    this.deletedHeading = page.getByRole('heading', { name: 'Account Deleted!' });
    this.continueButton = page.getByRole('link', { name: 'Continue' });
  }

  async expectAccountDeleted(){
    await expect(this.page).toHaveURL(this.path);
    await expect(this.deletedHeading).toBeVisible();
    // toHaveCSS compara o valor computado, que o browser sempre devolve como rgb()
  }

  async continueToHome() {
    await this.continueButton.click();
  }
}