import { expect, type Locator, type Page } from "@playwright/test";
import { UserType } from "../types/user.type";
export class SignupPage {
  protected readonly path = "/signup";

  readonly page: Page;
  readonly form: Locator;

  constructor(page: Page) {

    this.page = page;

    this.form = page.locator(".login-form");
  }

  async expectRegisterForm(){
    await expect(this.page.getByRole('heading', { name: 'Enter Account Information' }))
    .toBeVisible();
    await expect(this.form).toBeVisible();
  }

  async fillRegisterForm(user : UserType) {

    if(user.title === 'Mr.') {
      await this.form.locator('#id_gender1').check();
    }else {
      await this.form.locator('#id_gender2').check();
    }
    await expect(this.form.locator('#name')).toHaveValue(user.name);
    await expect(this.form.locator('#email')).toHaveValue(user.email);
    await this.form.locator('#password').fill(user.password);
    await this.form.locator('#days').selectOption(user.day);
    await this.form.locator('#months').selectOption(user.month);
    await this.form.locator('#years').selectOption(user.year);

    if(user.newsletter) {
      await this.form.locator('#newsletter').check();
    }
    if(user.specialOffers) {
      await this.form.locator('#optin').check();
    }

    await this.form.locator('#first_name').fill(user.firstName);
    await this.form.locator('#last_name').fill(user.lastName);

    if(user.company) {
      await this.form.locator('#company').fill(user.company);
    }

    await this.form.locator('#address1').fill(user.address);

    if(user.address2) {
      await this.form.locator('#address2').fill(user.address2);
    }

    await this.form.locator('#country').selectOption(user.country);
    await this.form.locator('#state').fill(user.state);
    await this.form.locator('#city').fill(user.city);
    await this.form.locator('#zipcode').fill(user.zipcode);
    await this.form.locator('#mobile_number').fill(user.mobile);
  }


  async submitRegisterForm() {
    await this.form.getByRole('button', { name: 'Create Account' }).click();
  }
}