import { expect, type Locator, type Page } from "@playwright/test";
import { MenuLinks } from "../enum/menu-links.enum";

export class HomePage {
  protected readonly path = "/";

  readonly page: Page;

  readonly header: Locator;

  constructor(page: Page) {

    this.page = page;

    this.header = page.locator(".shop-menu");
  }

  async navigate(){
    await this.page.goto(this.path);
  }

  async expectHeader(){
    await expect(this.page).toHaveURL(this.path);
    await expect(this.header).toBeVisible();
  }

  async menuClick(option: MenuLinks): Promise<void> {
    await this.header.getByRole('link', { name: option }).click();
  }

  async checkLoggedIn(username: string){
      //se logado

      //não deve exibir as opções de login e cadastro
      await expect(this.header.getByRole('link', { name: 'Signup / Login' })).toBeHidden();

      //deve exibir a opção de logout 
      await expect(this.header.getByRole('link', { name: 'Logout' })).toBeVisible();

      //deve exibir a opção de delete account
      await expect(this.header.getByRole('link', { name: 'Delete Account' })).toBeVisible();

      //deve exibir o nome do usuario logado
      await expect(
        this.header.getByText(`Logged in as ${username}`, { exact: true }),
      ).toBeVisible();
  }

  async checkLoggedOut(){
      //se deslogado

      //deve exibir as opções de login e cadastro
      await expect(this.header.getByRole('link', { name: 'Signup / Login' })).toBeVisible();

      //não deve exibir a opção de logout
      await expect(this.header.getByRole('link', { name: 'Logout' })).toBeHidden();

      //não deve exibir a opção de delete account
      await expect(this.header.getByRole('link', { name: 'Delete Account' })).toBeHidden();
  }
}