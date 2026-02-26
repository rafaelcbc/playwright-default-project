# 🎭 Playwright Test Automation Framework

![Playwright](https://img.shields.io/badge/Playwright-1.58.2-45ba4b?style=flat-square&logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)
![Node](https://img.shields.io/badge/Node-20.x-339933?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)

Framework de automação de testes E2E robusto e escalável, construído com Playwright e TypeScript, seguindo as melhores práticas da indústria com **Page Object Model (POM)** e **Custom Fixtures**.

---

## 📋 Índice

- [Características](#-características)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Executando os Testes](#-executando-os-testes)
- [Configuração](#-configuração)
- [Padrões e Boas Práticas](#-padrões-e-boas-práticas)
- [Relatórios](#-relatórios)
- [CI/CD](#-cicd)
- [Contribuindo](#-contribuindo)

---

## ✨ Características

- ✅ **Page Object Model (POM)** - Separação clara de responsabilidades
- ✅ **Custom Fixtures** - Injeção de dependências elegante e reutilizável
- ✅ **TypeScript** - Type-safety e melhor experiência de desenvolvimento
- ✅ **Multi-browser** - Testes em Chromium, Firefox e WebKit
- ✅ **Paralelização** - Execução paralela para maior velocidade
- ✅ **Trace & Screenshots** - Debugging facilitado com capturas automáticas em falhas
- ✅ **CI/CD Ready** - Configurado para integração contínua
- ✅ **Environment Variables** - Gerenciamento de configurações via `.env`
- ✅ **Best Practices** - Segue as diretrizes oficiais do Playwright

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas para máxima manutenibilidade:

```
┌─────────────────────────────────────────┐
│           Test Specs (.spec.ts)         │  ← Fluxos de negócio + Assertions
├─────────────────────────────────────────┤
│         Fixtures (test-base.ts)         │  ← Injeção de dependências
├─────────────────────────────────────────┤
│        Page Objects (*.page.ts)         │  ← Mapeamento de elementos
├─────────────────────────────────────────┤
│            Utils & Helpers              │  ← Funções auxiliares
└─────────────────────────────────────────┘
```

### Separação de Responsabilidades

| Camada | Responsabilidade | ❌ Proibido |
|--------|------------------|-------------|
| **Pages** | Mapeamento de elementos + ações | `expect()`, lógica de negócio |
| **Fixtures** | Instanciar e prover páginas | Lógica de teste |
| **Tests** | Fluxo de negócio + asserções | Instanciar páginas diretamente |
| **Utils** | Funções auxiliares reutilizáveis | Dependências de páginas |

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** - versão 18.x ou superior
- **npm** ou **yarn** - Gerenciador de pacotes
- **Git** - Para controle de versão

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd playwright-default-project
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Instale os navegadores do Playwright

```bash
npx playwright install
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
BASE_URL=http://localhost:3000
# Adicione outras variáveis conforme necessário
```

---

## 📁 Estrutura do Projeto

```
playwright-default-project/
├── 📂 data/                    # Massa de dados para testes
├── 📂 fixtures/                # Custom fixtures (injeção de dependências)
│   └── test-base.ts           # Fixture base com Page Objects
├── 📂 pages/                   # Page Object Model
│   ├── base.page.ts           # Página base com métodos comuns
│   ├── login.page.ts          # Page Object de Login
│   └── components/            # Componentes reutilizáveis
├── 📂 prompts/                 # Documentação e guias
│   ├── playwright-best-practices.md
│   └── non-functional-requirements.prompt.md
├── 📂 tests/                   # Arquivos de teste
│   ├── auth/                  # Testes de autenticação
│   │   └── login.spec.ts
│   └── e2e/                   # Testes end-to-end
│       └── example.spec.ts
├── 📂 utils/                   # Utilitários e helpers
├── 📂 playwright-report/       # Relatórios HTML gerados
├── 📂 test-results/           # Resultados e artefatos dos testes
├── playwright.config.ts       # Configuração do Playwright
├── package.json               # Dependências do projeto
└── README.md                  # Este arquivo
```

---

## 🧪 Executando os Testes

### Executar todos os testes

```bash
npx playwright test
```

### Executar testes de um arquivo específico

```bash
npx playwright test tests/auth/login.spec.ts
```

### Executar testes por navegador

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Executar em modo debug

```bash
npx playwright test --debug
```

### Executar com UI Mode (interativo)

```bash
npx playwright test --ui
```

### Executar testes com headed browser

```bash
npx playwright test --headed
```

---

## ⚙️ Configuração

O arquivo [playwright.config.ts](playwright.config.ts) contém as configurações principais:

### Configurações Destacadas

- **baseURL**: URL base definida via env var `BASE_URL`
- **Paralelização**: Testes executam em paralelo por padrão
- **Retries**: 2 tentativas em CI, 0 em desenvolvimento
- **Artifacts**: Screenshots, vídeos e traces apenas em falhas
- **Browsers**: Chromium, Firefox e WebKit habilitados

### Personalizando para CI

O projeto detecta automaticamente ambiente CI via `process.env.CI`:

```typescript
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 1 : undefined,
reporter: process.env.CI ? [['github'], ['html']] : [['list'], ['html']],
```

---

## 📚 Padrões e Boas Práticas

### 1. Page Object Model

**✅ CORRETO**

```typescript
// pages/login.page.ts
export class LoginPage extends BasePage {
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page);
        this.emailInput = page.getByLabel('E-mail');
        this.passwordInput = page.getByLabel('Senha');
        this.submitButton = page.getByRole('button', { name: 'Entrar' });
    }

    async doLogin(email: string, pass: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(pass);
        await this.submitButton.click();
    }
}
```

❌ **ERRADO**: Não coloque `expect()` dentro de Page Objects!

### 2. Custom Fixtures

```typescript
// fixtures/test-base.ts
export const test = base.extend<MyFixtures>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },
});
```

### 3. Specs de Teste

```typescript
// tests/auth/login.spec.ts
import { test, expect } from '../../fixtures/test-base';

test('Deve realizar login com sucesso', async ({ loginPage, page }) => {
    await loginPage.goto('/login');
    await loginPage.doLogin('usuario@teste.com', 'senhaSegura123');
    
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

### 4. Seletores Recomendados (ordem de prioridade)

1. `getByRole()` - Baseado em acessibilidade
2. `getByLabel()` - Para inputs de formulário
3. `getByPlaceholder()` - Quando label não existe
4. `getByText()` - Para elementos de texto
5. `getByTestId()` - Último recurso

❌ **Evite**: CSS/XPath complexos

### 5. Web-First Assertions

```typescript
// ✅ Correto - Auto-waiting
await expect(page.getByText('Success')).toBeVisible();

// ❌ Errado - Sem auto-waiting
expect(await page.getByText('Success').isVisible()).toBe(true);
```

Para mais detalhes, consulte [prompts/playwright-best-practices.md](prompts/playwright-best-practices.md).

---

## 📊 Relatórios

### Relatório HTML

Após executar os testes, visualize o relatório:

```bash
npx playwright show-report
```

O relatório será aberto automaticamente no navegador com:
- ✅ Status dos testes (pass/fail)
- 📸 Screenshots de falhas
- 🎥 Vídeos das execuções
- 🔍 Traces para debugging

### Trace Viewer

Para analisar traces de testes falhados:

```bash
npx playwright show-trace test-results/<caminho-do-trace>/trace.zip
```

---

## 🔄 CI/CD

### GitHub Actions

Exemplo de workflow básico:

```yaml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
        
      - name: Run Playwright tests
        run: npx playwright test
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Diretrizes

- Siga os padrões estabelecidos no código existente
- Adicione testes para novas funcionalidades
- Mantenha os commits atômicos e bem descritos
- Certifique-se de que todos os testes passam antes do PR

---

## 📝 License

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Suporte

- 📖 [Documentação Oficial do Playwright](https://playwright.dev)
- 💬 [Playwright Discord](https://aka.ms/playwright/discord)
- 🐛 [Reportar um Bug](../../issues)

---

## 🙏 Agradecimentos

- [Playwright Team](https://playwright.dev) - Pelo framework incrível
- [Microsoft](https://github.com/microsoft/playwright) - Por manter o projeto open-source

---

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

