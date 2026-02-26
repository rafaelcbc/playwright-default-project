# Playwright E2E Testing — Guia Definitivo de Boas Práticas

## 🎯 Filosofia Central

**Exploração Manual (MCP) → Arquitetura Sólida (POM + Fixtures) → Automação Confiável**

Nenhuma automação pode ser construída sem compreensão profunda do comportamento real da aplicação através de exploração manual via MCP (Manual Control Protocol).

---

## 📐 Stack Tecnológica

- **Framework:** Playwright Test
- **Linguagem:** TypeScript (Strict Mode)
- **Padrão Arquitetural:** Page Object Model (POM) + Custom Fixtures
- **Metodologia:** MCP-First (Exploração Manual Antes de Código)

---

## 🔄 Fluxo de Trabalho Obrigatório

### 🔍 FASE 1 — Exploração Manual via MCP (PRÉ-REQUISITO)

**⚠️ REGRA INQUEBRÁVEL: Nenhum código de teste pode ser escrito antes desta fase estar 100% completa.**

#### Passos Obrigatórios:

1. **Receber o cenário** (ex: CTXXXX ou descrição de funcionalidade)
2. **Executar manualmente via Playwright MCP:**
   - Inspecionar cada elemento interativo
   - Analisar estrutura HTML completa
   - Identificar roles ARIA, labels, placeholders
   - Observar estados (loading, disabled, hidden, visible)
   - Mapear animações, transições e carregamentos assíncronos
   - Capturar mensagens de erro e sucesso

3. **Documentar descobertas:**
   ```markdown
   ✅ Passo 1: Navegação inicial
   - URL: /login
   - Estado: Formulário visível
   - Localizadores: getByRole('textbox', { name: 'Email' })
   
   ✅ Passo 2: Preenchimento de formulário
   - Email input: getByLabel('Email')
   - Password input: getByLabel('Senha')
   - Submit button: getByRole('button', { name: 'Entrar' })
   
   ✅ Passo 3: Validação pós-login
   - Redirect: /dashboard
   - Elemento de confirmação: getByText('Bem-vindo')
   ```

#### Checklist de Saída da Fase 1:
- [ ] Todos os passos executados manualmente via MCP
- [ ] HTML inspecionado e anotado
- [ ] Localizadores candidatos listados (sem código)
- [ ] Estados e transições mapeados
- [ ] Pontos críticos identificados

**🚫 Se esta fase não estiver completa, PARE. Não prossiga para Fase 2.**

---

### 🧩 FASE 2 — Implementação Automatizada

**Somente inicie após aprovação explícita da Fase 1.**

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Diretórios

```
/pages       → Classes POM (ZERO asserções, apenas mapeamento)
/fixtures    → Extensão do objeto test (integração POM)
/tests       → Specs (.spec.ts) com fluxo de negócio + asserts
/data        → Massa de dados (.json, .csv)
/utils       → Helpers (API calls, geradores, formatadores)
```

### Separação de Responsabilidades

| Camada | Responsabilidade | Proibido |
|--------|------------------|----------|
| **Pages** | Mapeamento de elementos + ações | `expect()`, lógica de negócio |
| **Fixtures** | Instanciar e prover páginas | Lógica de teste |
| **Tests** | Fluxo de negócio + asserções | Instanciar páginas diretamente |
| **Utils** | Funções auxiliares reutilizáveis | Dependências de páginas |

---

## 📝 Padrões de Código (Regras Estritas)

### 1. Page Object Model (POM)

```typescript
// ✅ CORRETO - pages/base.page.ts
import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}
```

```typescript
// ✅ CORRETO - pages/login.page.ts
import { BasePage } from './base.page';
import { Page, Locator } from '@playwright/test';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    // Localizadores baseados em ARIA/acessibilidade
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Senha');
    this.submitButton = page.getByRole('button', { name: 'Entrar' });
    this.errorMessage = page.getByRole('alert');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    // ❌ NUNCA usar expect() aqui
  }

  async navigateToLogin() {
    await this.page.goto('/login');
  }
}
```

**🚫 PROIBIDO em Pages:**
- Conter `expect()` ou qualquer asserção
- Lógica de negócio complexa
- Hardcoded URLs (usar variáveis de ambiente)

---

### 2. Custom Fixtures

```typescript
// ✅ CORRETO - fixtures/test-base.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from '@playwright/test';
```

---

### 3. Test Specs

```typescript
// ✅ CORRETO - tests/auth/login.spec.ts
import { test, expect } from '../../fixtures/test-base';

test.describe('Login Flow', () => {
  test('deve realizar login com credenciais válidas', async ({ 
    loginPage, 
    dashboardPage, 
    page 
  }) => {
    // Arrange (estado inicial)
    await loginPage.navigateToLogin();
    await expect(loginPage.emailInput).toBeVisible();

    // Act (ação)
    await loginPage.login('user@example.com', 'password123');

    // Assert (validação)
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(dashboardPage.welcomeMessage).toBeVisible();
    await expect(dashboardPage.welcomeMessage).toHaveText('Bem-vindo');
  });

  test('deve exibir erro com credenciais inválidas', async ({ loginPage }) => {
    await loginPage.navigateToLogin();
    await loginPage.login('invalid@example.com', 'wrongpassword');
    
    // Checkpoint crítico
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Credenciais inválidas');
  });
});
```

**❌ NUNCA FAZER:**
```typescript
// ❌ ERRADO - Instanciação direta
const loginPage = new LoginPage(page); // Usar fixture!

// ❌ ERRADO - Asserção no Page Object
// (dentro de login.page.ts)
async login(email, password) {
  await this.emailInput.fill(email);
  await expect(this.submitButton).toBeEnabled(); // ❌ REMOVER
}
```

---

## 🎯 Localizadores (Ordem de Prioridade)

### Hierarquia Obrigatória:

1. **`getByRole()`** — Máxima prioridade (acessibilidade)
   ```typescript
   page.getByRole('button', { name: 'Salvar' })
   page.getByRole('textbox', { name: 'Email' })
   page.getByRole('heading', { name: 'Dashboard' })
   ```

2. **`getByLabel()`** — Para inputs com `<label>`
   ```typescript
   page.getByLabel('Nome completo')
   page.getByLabel('CPF', { exact: true })
   ```

3. **`getByPlaceholder()`** — Se não houver label
   ```typescript
   page.getByPlaceholder('Digite seu email')
   ```

4. **`getByText()`** — Texto visível e estável
   ```typescript
   page.getByText('Confirmar compra')
   page.getByText(/sucesso|concluído/i)
   ```

5. **`getByTestId()`** — Último recurso
   ```typescript
   page.getByTestId('submit-checkout-btn')
   ```

### 🚫 Proibido:

```typescript
// ❌ CSS/XPath frágeis
page.locator('.btn.btn-primary.submit-form')
page.locator('//div[@class="container"]/span[2]/button')

// ❌ IDs/classes dinâmicas
page.locator('#user-12345') // ID gerado dinamicamente

// ❌ Dependência de índice
page.locator('button').nth(3) // Quebrará se ordem mudar
```

---

## ✅ Asserções e Esperas

### Usar APENAS Web-First Assertions (Auto-Retry)

```typescript
// ✅ CORRETO
await expect(locator).toBeVisible()
await expect(locator).toBeHidden()
await expect(locator).toBeEnabled()
await expect(locator).toHaveText('Sucesso')
await expect(locator).toHaveValue('123')
await expect(locator).toContainText(/erro|falha/i)
await expect(page).toHaveURL(/dashboard/)
await expect(page).toHaveTitle('Minha Aplicação')
```

### 🚫 Proibido:

```typescript
// ❌ NUNCA usar waitForTimeout
await page.waitForTimeout(5000); // REMOVER

// ❌ NUNCA usar assert do Node.js
import assert from 'assert';
assert.equal(await locator.textContent(), 'Teste'); // REMOVER

// ❌ NUNCA usar esperas desnecessárias
await page.waitForTimeout(1000); // Playwright já tem auto-wait
```

### Esperas Explícitas (Apenas quando necessário)

```typescript
// ✅ Esperar estado específico
await locator.waitFor({ state: 'visible' })
await locator.waitFor({ state: 'hidden' })

// ✅ Esperar resposta de API
await page.waitForResponse(resp => resp.url().includes('/api/users'))

// ✅ Esperar navegação
await page.waitForURL('**/dashboard')
```

---

## 🚀 Otimização via API (Automação Inteligente)

**Regra:** Se o teste NÃO for focado em login/autenticação, evite UI.

```typescript
// ✅ CORRETO - Setup via API
import { test as setup } from '@playwright/test';

setup('autenticar via API', async ({ request }) => {
  const response = await request.post('/api/auth/login', {
    data: {
      email: 'user@example.com',
      password: 'password123'
    }
  });

  const { token } = await response.json();
  
  // Salvar estado para reutilizar
  await request.storageState({ path: 'auth/user.json' });
});

// Usar em testes
test.use({ storageState: 'auth/user.json' });
```

---

## 🛡️ Checkpoints Críticos

### Adicionar validações após:

```typescript
// 1. Estado inicial
await expect(page).toHaveURL('/checkout');
await expect(page.getByRole('heading')).toHaveText('Finalizar Compra');

// 2. Clicks críticos
await paymentButton.click();
await expect(page.getByText('Processando')).toBeVisible();

// 3. Submits
await submitButton.click();
await expect(successMessage).toBeVisible();

// 4. Navegações
await page.goto('/products');
await expect(page.getByRole('heading', { name: 'Produtos' })).toBeVisible();

// 5. Estado final
await expect(page).toHaveURL(/.*success/);
await expect(confirmationMessage).toContainText('Pedido #');
```

---

## 🔄 Isolamento de Testes

### Princípios:

1. **Independência total** — Cada teste cria seu próprio estado
2. **Sem dependências** — Testes não dependem de execuções anteriores
3. **Ordem aleatória** — Deve rodar em qualquer ordem
4. **Cleanup automático** — Playwright reseta contexto entre testes

```typescript
// ✅ CORRETO - Teste isolado
test('adicionar produto ao carrinho', async ({ page }) => {
  // Criar estado inicial dentro do teste
  await page.goto('/products');
  await createTestUser(); // Helper para estado limpo
  
  // Executar teste
  await addProductToCart('Product A');
  
  // Validar
  await expect(cartBadge).toHaveText('1');
});
```

```typescript
// ❌ ERRADO - Dependência entre testes
test('fazer login', async ({ loginPage }) => {
  await loginPage.login('user@test.com', 'pass');
});

test('ver perfil', async ({ page }) => {
  // ❌ Assume que login já foi feito
  await page.goto('/profile');
});
```

---

## 🖥️ Configuração de Execução

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    headless: false, // Execução visível para debugging
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

---

## 📋 Checklist Final (Antes de Commit)

- [ ] **Fase MCP completa?** Exploração manual documentada
- [ ] **Arquitetura correta?** POM + Fixtures implementados
- [ ] **Localizadores semânticos?** Prioridade: `getByRole()`
- [ ] **Zero asserções em Pages?** Apenas em `.spec.ts`
- [ ] **Web-first assertions?** `expect(locator).toBe...()`
- [ ] **Sem `waitForTimeout()`?** Esperas explícitas apenas
- [ ] **Checkpoints críticos?** Validação de estados
- [ ] **Testes isolados?** Sem dependências externas
- [ ] **Testes passando?** Execute com `npx playwright test`
- [ ] **Código TypeScript válido?** `npm run type-check`

---

## 🎯 Resumo dos Princípios Inquebráveis

| # | Regra | Motivo |
|---|-------|--------|
| 1 | MCP antes de código | Evita suposições e seletores frágeis |
| 2 | Zero `expect()` em Pages | Separação de responsabilidades |
| 3 | Fixtures sempre | Injeção de dependências limpa |
| 4 | `getByRole()` primeiro | Acessibilidade + estabilidade |
| 5 | Web-first assertions | Auto-retry embutido |
| 6 | Sem `waitForTimeout()` | Indeterminístico e flaky |
| 7 | Checkpoints explícitos | Debugging facilitado |
| 8 | Isolamento total | Testes confiáveis |

---

## 📚 Exemplos Práticos

### Exemplo Completo: Fluxo de Checkout

```typescript
// pages/checkout.page.ts
export class CheckoutPage extends BasePage {
  readonly fullNameInput: Locator;
  readonly addressInput: Locator;
  readonly cardNumberInput: Locator;
  readonly confirmButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.fullNameInput = page.getByLabel('Nome completo');
    this.addressInput = page.getByLabel('Endereço');
    this.cardNumberInput = page.getByLabel('Número do cartão');
    this.confirmButton = page.getByRole('button', { name: 'Confirmar compra' });
    this.successMessage = page.getByRole('status');
  }

  async fillCheckoutForm(data: CheckoutData) {
    await this.fullNameInput.fill(data.fullName);
    await this.addressInput.fill(data.address);
    await this.cardNumberInput.fill(data.cardNumber);
  }

  async submitCheckout() {
    await this.confirmButton.click();
  }
}

// tests/e2e/checkout.spec.ts
import { test, expect } from '../../fixtures/test-base';

test('checkout completo com sucesso', async ({ checkoutPage, page }) => {
  // 1. Estado inicial (checkpoint)
  await page.goto('/checkout');
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();

  // 2. Preencher formulário
  await checkoutPage.fillCheckoutForm({
    fullName: 'João Silva',
    address: 'Rua Teste, 123',
    cardNumber: '4111111111111111'
  });

  // 3. Checkpoint antes de submit
  await expect(checkoutPage.confirmButton).toBeEnabled();

  // 4. Submit
  await checkoutPage.submitCheckout();

  // 5. Aguardar processamento (espera explícita)
  await checkoutPage.successMessage.waitFor({ state: 'visible' });

  // 6. Validação final (checkpoint)
  await expect(checkoutPage.successMessage).toContainText('Compra confirmada');
  await expect(page).toHaveURL(/.*success/);
});
```

---

## 🔧 Troubleshooting

### Problema: Elemento não encontrado

1. Voltar ao MCP → Inspecionar novamente
2. Verificar se elemento está em iframe/shadow DOM
3. Confirmar timing (elemento aparece após async?)
4. Validar seletor com `page.locator().highlight()`

### Problema: Teste flaky

1. Identificar pontos de falha (screenshots/videos)
2. Adicionar checkpoints antes de interações
3. Remover `waitForTimeout()` por esperas explícitas
4. Verificar race conditions (network, animações)

---

**Versão:** 1.0  
**Data:** 2025  
**Compatibilidade:** Playwright ^1.40+
