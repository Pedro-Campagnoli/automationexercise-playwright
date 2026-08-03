import { MenuLinks } from "../enums/menu-links.enum";
import { test } from "../fixtures";
import { createUser } from "../utils/user.factory";

test('Test Case 1: Register User', async ({ homePage, loginPage, signupPage, accountCreatedPage, accountDeletedPage }) => {
  const userData = createUser();

  // Dado que estou na home page, deslogado
  await homePage.navigate();
  await homePage.expectHeader();
  await homePage.checkLoggedOut();

  // Quando acesso "Signup / Login" e informo um nome e um e-mail ainda não cadastrados
  await homePage.menuClick(MenuLinks.SIGNUP_LOGIN);
  await loginPage.expectSignupForm();
  await loginPage.fillSignupForm(userData.name, userData.email);
  await loginPage.signupSubmit();

  // E preencho os dados da conta e confirmo o cadastro
  await signupPage.expectRegisterForm();
  await signupPage.fillRegisterForm(userData);
  await signupPage.submitRegisterForm();

  // Então a conta é criada e volto para a home logado com o meu nome
  await accountCreatedPage.expectAccountCreated();
  await accountCreatedPage.continueToHome();
  await homePage.checkLoggedIn(userData.name);

  // Quando apago a conta
  await homePage.menuClick(MenuLinks.DELETE_ACCOUNT);

  // Então a exclusão é confirmada e volto para a home deslogado
  await accountDeletedPage.expectAccountDeleted();
  await accountDeletedPage.continueToHome();
  await homePage.checkLoggedOut();
  await homePage.expectHeader();
});

test('Test Case 2: Login User with correct email and password', async ({ homePage, loginPage, accountApi, accountDeletedPage }) => {
  const userData = createUser();

  // Dado que existe uma conta cadastrada 
  await accountApi.createAccount(userData);

  // E estou na home page, deslogado
  await homePage.navigate();
  await homePage.checkLoggedOut();

  // Quando acesso "Signup / Login" e informo o e-mail e a senha corretos
  await homePage.menuClick(MenuLinks.SIGNUP_LOGIN);
  await loginPage.expectLoginForm();
  await loginPage.fillLoginForm(userData.email, userData.password);
  await loginPage.loginSubmit();

  // Então estou logado com o meu nome
  await homePage.checkLoggedIn(userData.name);

  // Quando apago a conta
  await homePage.menuClick(MenuLinks.DELETE_ACCOUNT);

  // Então a exclusão é confirmada
  await accountDeletedPage.expectAccountDeleted();
});

test('Test Case 3: Login User with incorrect email and password', async ({ homePage, loginPage }) => {
  const UserData = createUser();

  // Dado que estou na home page, deslogado
  await homePage.navigate();
  await homePage.expectHeader();
  await homePage.checkLoggedOut();

  // Quando acesso "Signup / Login" e informo credenciais de uma conta que não existe
  await homePage.menuClick(MenuLinks.SIGNUP_LOGIN);
  await loginPage.expectLoginForm();
  await loginPage.fillLoginForm(UserData.email, UserData.password);
  await loginPage.loginSubmit();

  // Então vejo o erro de credenciais e continuo deslogado
  await loginPage.expectLoginError();
  await homePage.checkLoggedOut();
});

test('Test Case 4: Logout User', async ({ homePage, loginPage, accountApi }) => {
  const UserData = createUser();

  // Dado que existe uma conta cadastrada
  await accountApi.createAccount(UserData);

  // E estou logado com ela
  await homePage.navigate();
  await homePage.menuClick(MenuLinks.SIGNUP_LOGIN);
  await loginPage.expectLoginForm();
  await loginPage.fillLoginForm(UserData.email, UserData.password);
  await loginPage.loginSubmit();
  await homePage.checkLoggedIn(UserData.name);

  // Quando aciono "Logout"
  await homePage.menuClick(MenuLinks.LOGOUT);

  // Então volto para o estado deslogado
  await homePage.checkLoggedOut();

  // Limpeza: a conta sobrevive ao logout, então some via API
  await accountApi.deleteAccount(UserData.email, UserData.password);
});

test('Test Case 5: Register User with existing email', async ({ homePage, loginPage, accountApi }) => {
  const UserData = createUser();

  // Dado que já existe uma conta com este e-mail (criada via API, não pela interface)
  await accountApi.createAccount(UserData);

  // E estou na home page, deslogado
  await homePage.navigate();
  await homePage.expectHeader();

  // Quando tento me cadastrar reaproveitando o mesmo e-mail
  await homePage.menuClick(MenuLinks.SIGNUP_LOGIN);
  await loginPage.expectSignupForm();
  await loginPage.fillSignupForm(UserData.name, UserData.email);
  await loginPage.signupSubmit();

  // Então vejo o erro de e-mail já existente e continuo deslogado
  await loginPage.expectSignupError();
  await homePage.checkLoggedOut();

  // Limpeza: o cadastro falhou, mas a conta do Dado continua lá
  await accountApi.deleteAccount(UserData.email, UserData.password);
});


