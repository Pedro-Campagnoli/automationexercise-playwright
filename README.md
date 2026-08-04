# AutomationExercise — Testes E2E com Playwright

[![Playwright Tests](https://github.com/Pedro-Campagnoli/automationexercise-playwright/actions/workflows/playwright.yml/badge.svg)](https://github.com/Pedro-Campagnoli/automationexercise-playwright/actions/workflows/playwright.yml)

Suíte de testes automatizados end-to-end para o site [automationexercise.com](https://automationexercise.com), seguindo a [lista oficial de casos de teste](https://automationexercise.com/test_cases) do próprio site.

Escrita em **Playwright + TypeScript**, com Page Objects, fixtures customizadas, massa de dados aleatória via Faker e uso da API do site para preparar pré-condições.

> O site sob teste é público e compartilhado. Todo teste que cria uma conta é responsável por apagá-la no final.

---

## Sumário

- [Stack](#stack)
- [Instalação](#instalação)
- [Como rodar](#como-rodar)
- [Cobertura de testes](#cobertura-de-testes)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Decisões de arquitetura](#decisões-de-arquitetura)
- [Como adicionar um novo teste](#como-adicionar-um-novo-teste)
- [Convenções](#convenções)
- [Investigando falhas](#investigando-falhas)
- [CI](#ci)
- [Limitações conhecidas](#limitações-conhecidas)

---

## Stack

| Ferramenta | Papel |
|---|---|
| [Playwright](https://playwright.dev) | Runner, asserções e automação do browser |
| TypeScript | Linguagem dos testes, com verificação de tipos em `strict` via `tsconfig.json` |
| [Faker](https://fakerjs.dev) | Geração de massa de dados aleatória |
| dotenv | Carrega a URL base a partir do `.env` |
| pnpm | Gerenciador de pacotes |
| GitHub Actions | Execução da suíte em cada push e pull request |

---

## Instalação

Requer **Node.js 18+** (o CI usa a versão LTS) e **pnpm**.

```bash
git clone git@github.com:Pedro-Campagnoli/automationexercise-playwright.git
cd automationexercise-playwright

pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps
```

Crie um arquivo `.env` na raiz com a URL base:

```env
BASE_URL=https://automationexercise.com
```

> **O `.env` é obrigatório.** Ele não é versionado, e sem a variável `BASE_URL` todo `page.goto('/')` e toda chamada de API falham. É a primeira coisa a checar num clone novo.

---

## Como rodar

```bash
pnpm test                            # abre o modo UI (interativo)
pnpm debug                           # abre o Inspector, passo a passo
pnpm exec playwright test            # execução headless — é o que o CI faz
pnpm exec playwright test --headed   # headless desligado, browser visível
pnpm exec playwright show-report     # abre o último relatório HTML
pnpm typecheck                       # tsc --noEmit — checagem de tipos, sem rodar teste
```

> O Playwright transpila sem checar tipos, então **a suíte e o typecheck são verificações separadas**: uma execução verde não diz nada sobre os tipos. O CI roda os dois.

Rodando um subconjunto:

```bash
pnpm exec playwright test -g "Test Case 1"                 # por título
pnpm exec playwright test tests/specs/test-cases.spec.ts   # por arquivo
pnpm exec playwright test --retries=0                      # sem retentativa (útil ao investigar flakiness)
```

> **Atenção:** `pnpm test` **não** roda a suíte headless — ele abre o modo UI e fica aberto esperando interação. Para uma execução completa em terminal ou pipeline, use `pnpm exec playwright test`.

### Configuração relevante

| Opção | Valor | Efeito |
|---|---|---|
| `testDir` | `./tests/specs` | Só essa pasta é varrida em busca de testes |
| `fullyParallel` | `true` | Testes rodam em paralelo, inclusive dentro do mesmo arquivo |
| `retries` | `2` | Vale **também localmente**, não só no CI |
| `timeout` | 60s por teste / 10s por asserção | |
| `projects` | apenas `chromium` | Firefox e WebKit estão comentados no config |
| `trace` | `on-first-retry` | Trace é gravado só quando um teste falha e é reexecutado |

---

## Cobertura de testes

5 dos 26 casos oficiais estão implementados — todos do fluxo de conta.

| # | Caso de teste | Pré-condição | O que valida |
|:-:|---|---|---|
| 1 | Register User | — | Cadastro completo pela interface, login automático e exclusão da conta |
| 2 | Login User with correct email and password | Conta via API | Login com credenciais válidas e exclusão pela interface |
| 3 | Login User with incorrect email and password | — | Mensagem de erro para credenciais inexistentes |
| 4 | Logout User | Conta via API | Logout devolve o header ao estado deslogado |
| 5 | Register User with existing email | Conta via API | Erro `Email Address already exist!` ao reusar um e-mail |

Os casos 2, 4 e 5 precisam de uma conta pronta, mas **nenhum deles testa cadastro** — então a conta é criada pela API, e o browser só exercita o comportamento sob teste. O Caso 1 é o único que percorre o cadastro pela interface, porque é justamente o que ele testa.

---

## Estrutura do projeto

```
tests/
├── api/          AccountApi — cria e apaga contas via REST (+ barrel)
├── enums/        Restrições do site: MenuLinks, Titles, Country
├── pages/        Page Objects, um por página do site (+ barrel)
├── specs/        Os testes  ← testDir aponta aqui
├── types/        Shapes de dado (UserType)
├── utils/        user.factory.ts — massa de dados via Faker
└── fixtures.ts   Ponto de entrada: injeta os Page Objects e a API nos testes
```

Cada arquivo carrega um sufixo que diz o que ele é: `.page.ts`, `.api.ts`, `.enum.ts`, `.type.ts`, `.factory.ts`, `.spec.ts`.

**`enums/` vs `types/`:** `enums/` guarda restrições que o site impõe (as 7 opções do select de país, os rótulos dos links do header); `types/` guarda formato de dado. Um enum não pertence a `types/`.

---

## Decisões de arquitetura

### Page Objects com asserções embutidas

Cada classe em `tests/pages/` representa uma página e concentra tanto as ações quanto as verificações daquela tela. O spec não conhece seletores — ele lê como um roteiro:

```ts
await homePage.menuClick(MenuLinks.SIGNUP_LOGIN);
await loginPage.expectSignupForm();
await loginPage.fillSignupForm(userData.name, userData.email);
```

Os métodos de verificação são nomeados `expect<Região>()` — `expectHeader`, `expectLoginForm`, `expectAccountCreated` — em vez de um `validate()` genérico. Assim cada teste declara exatamente de que parte da página ele depende.

Os locators são escopados a um container (`.shop-menu`, `.login-form`, `.signup-form`) porque o site renderiza o formulário de login e o de cadastro na mesma página, ambos com um campo `Email Address`.

### Fixtures como ponto de entrada

Os specs importam `test` de `../fixtures`, **nunca** de `@playwright/test`. Cada Page Object e a API são fixtures, então o teste declara o que precisa por desestruturação e nada é instanciado no corpo do teste:

```ts
test('Test Case 2: ...', async ({ homePage, loginPage, accountApi, accountDeletedPage }) => {
```

### API para pré-condição e limpeza

`AccountApi` cobre `POST /api/createAccount` e `DELETE /api/deleteAccount`. A ideia é chegar ao estado que o teste precisa pelo caminho mais rápido e confiável, deixando o browser apenas para o comportamento sob teste.

> **Detalhe importante:** essa API responde **HTTP 200 mesmo em falha lógica**, com o resultado real no corpo da resposta. Por isso o `AccountApi` verifica o status **e** o `responseCode`/`message` do body — checar só o status deixaria uma pré-condição falha passar silenciosamente e reaparecer depois como uma falha confusa na interface.

### Massa de dados aleatória

`createUser()` monta um `UserType` completo com Faker, e cada teste chama a função para si — assim nenhum teste apaga a conta de outro.

Alguns campos são deliberadamente restritos, porque o site ou as asserções não aceitam valor arbitrário:

| Campo | Restrição | Motivo |
|---|---|---|
| `country` | sorteado do enum `Country` | O select `#country` tem só 7 opções; `selectOption` falha em qualquer outra |
| `name` | um único nome, sem espaço | `checkLoggedIn` compara `Logged in as <name>` com `exact: true` |
| `zipcode`, `mobile` | só dígitos | Os geradores do Faker podem devolver letra, hífen ou ramal |
| `password` | só alfanumérico | Não depender de como o site trata caracteres especiais |
| `day` | máximo 28 | Garante que a data de nascimento sorteada exista |
| `email` | sufixo `Date.now()` + aleatório | Faker sozinho repete valores, e colisão aqui significa um teste apagando a conta de outro |

### Comentários no vocabulário Gherkin

Os testes são anotados com **Dado / Quando / E / Então**, agrupando os passos por intenção:

```ts
// Dado que existe uma conta cadastrada
await accountApi.createAccount(userData);

// Quando acesso "Signup / Login" e informo o e-mail e a senha corretos
await homePage.menuClick(MenuLinks.SIGNUP_LOGIN);
await loginPage.expectLoginForm();
await loginPage.fillLoginForm(userData.email, userData.password);
await loginPage.loginSubmit();

// Então estou logado com o meu nome
await homePage.checkLoggedIn(userData.name);
```

Passos que existem só para não deixar resíduo no site são marcados como `// Limpeza:`, e não como passo do cenário — apagar a conta ao fim dos Casos 4 e 5 não faz parte do caso oficial.

---

## Como adicionar um novo teste

1. **Página nova?** Crie `tests/pages/<nome>.page.ts` seguindo o padrão: `path`, locators atribuídos no construtor, `navigate()`, métodos `expect<Região>()` e métodos de ação.
2. **Exporte no barrel** `tests/pages/index.ts`.
3. **Registre a fixture** em `tests/fixtures.ts` — no type `Fixtures` e no `base.extend`.
4. **Escreva o teste** em `tests/specs/`, importando `test` de `../fixtures`.
5. **Precisa de conta pronta?** Use `accountApi.createAccount(userData)` no `Dado`. Não repita o cadastro pela interface.
6. **Criou conta? Apague.** Pela interface se a exclusão faz parte do caso, via API se for só limpeza.
7. **Anote os passos** com Dado / Quando / Então.
8. Rode com `--retries=0` algumas vezes antes de considerar pronto — a massa é aleatória, então repetições exercitam dados diferentes.

---

## Convenções

- Navegação pelo header sempre via enum `MenuLinks`, nunca string solta — um erro de digitação vira erro de compilação em vez de timeout de locator.
- Locators por `#id` escopados ao formulário para o cadastro; por role (`getByRole('link', { name })`) para navegação e títulos.
- Barrels (`index.ts`) existem em `pages/` e `api/` porque são as pastas que o `fixtures.ts` consome. As outras não têm, de propósito.
- `createUser()` é chamado **dentro** de cada teste, nunca no escopo do módulo.
- Comentários em português.

---

## Investigando falhas

```bash
pnpm exec playwright show-report     # relatório HTML da última execução
```

O relatório traz o passo que falhou, o erro e — quando houve retentativa — o **trace** completo, com timeline, DOM e network.

Dois atalhos que economizam tempo:

- **`test-results/<teste>/error-context.md`** contém o *snapshot de acessibilidade* da página no momento da falha. Quando um locator dá timeout, é ali que se descobre o role real do elemento. Foi assim que se descobriu que o botão `Continue` é, na verdade, um `<a>` — `getByRole('button')` ficava esperando até o timeout.
- **`pnpm debug`** abre o Inspector e permite executar passo a passo, testando locators ao vivo.

> Como a massa é aleatória, **uma falha pode não reproduzir na execução seguinte**. Antes de rodar de novo, pegue os valores concretos que causaram o problema no relatório ou no `error-context.md`.

E lembre que `retries: 2` também vale localmente: um teste intermitente pode aparecer como verde depois de falhar. O relatório mostra as tentativas — rode com `--retries=0` quando estiver investigando estabilidade.

---

## CI

`.github/workflows/playwright.yml` roda a cada push e pull request em `main`/`master`: `pnpm install --frozen-lockfile` → `pnpm typecheck` → `pnpm exec playwright test`, publicando o relatório HTML como artefato (retenção de 30 dias).

O typecheck vem **antes** de instalar os browsers: erro de tipo derruba o build em segundos, sem gastar o download do Chromium nem uma rodada contra o site.

No CI, `workers: 1` (execução serial) e `forbidOnly: true` — um `test.only` esquecido derruba o build.

Como o `.env` não é versionado, o workflow injeta a `BASE_URL` por conta própria: usa a [variável de repositório](https://docs.github.com/actions/learn-github-actions/variables) `BASE_URL` se ela existir, e cai em `https://automationexercise.com` caso contrário. Para apontar o CI para outro ambiente, basta criar essa variável — sem mexer no workflow.

---

## Limitações conhecidas

- **5 de 26 casos** oficiais implementados, todos do fluxo de conta.
- **Só `chromium`** está habilitado; Firefox e WebKit estão comentados no `playwright.config.ts`.
- **Tipos são checados por um passo à parte.** `pnpm typecheck` (`strict`, mais `noUncheckedIndexedAccess` e `noImplicitReturns`) roda no CI e cobre os 16 arquivos do projeto, mas o Playwright continua transpilando sem checar nada — rodar só a suíte não valida tipagem. Vale conferir também se o editor está usando o TypeScript do `node_modules` e não a versão embutida nele, senão editor e CI podem discordar.
- **`retries: 2` vale localmente**, o que pode mascarar instabilidade durante o desenvolvimento.
- **Caso 4 não valida a navegação para a página de login.** O caso oficial pede essa verificação após o logout; hoje o teste só confere o estado do header.
