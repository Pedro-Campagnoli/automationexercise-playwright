import { expect, type Locator, type Page } from "@playwright/test";

export class LoginPage {
  protected readonly path = "/login";

  readonly page: Page;
  readonly loginForm: Locator;
  readonly signupForm: Locator;

  constructor(page: Page) {

    this.page = page;

    this.loginForm = page.locator(".login-form");
    this.signupForm = page.locator(".signup-form");
  }

  async navigate(){
    await this.page.goto(this.path);

    await expect(this.page.getByRole('heading', { name: 'New User Signup!' }))
    .toBeVisible();
  }

  async expectLoginForm(){
    await expect(this.loginForm).toBeVisible();
    await expect(this.loginForm.getByRole('heading', { name: 'Login to your account' }))
    .toBeVisible();
  }

  async expectSignupForm(){
    await expect(this.signupForm).toBeVisible();
    await expect(this.signupForm.getByRole('heading', { name: 'New User Signup!' }))
    .toBeVisible();
  }

  async fillLoginForm(username: string, password: string) {
    await this.loginForm.getByPlaceholder('Email Address').fill(username);
    await this.loginForm.getByPlaceholder('Password').fill(password);
  }

  async loginSubmit(){
    await this.loginForm.getByRole('button', { name: 'Login' }).click();
  }

  async fillSignupForm(name: string, email: string) {
    await this.signupForm.getByPlaceholder('Name').fill(name);
    await this.signupForm.getByPlaceholder('Email Address').fill(email);
  }

  async signupSubmit(){
    await this.signupForm.getByRole('button', { name: 'Signup' }).click();
  }

  async expectLoginError(){
    await expect(this.loginForm.getByText('Your email or password is incorrect!'))
    .toBeVisible();
  }

  async expectSignupError(){
    await expect(this.signupForm.getByText('Email Address already exist!'))
    .toBeVisible();
  }
}