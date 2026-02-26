import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
// Importe outras páginas conforme o projeto cresce, ex: CheckoutPage

// Define os tipos das fixtures
type MyFixtures = {
    loginPage: LoginPage;
    // checkoutPage: CheckoutPage;
};

// Estende o teste base com nossas fixtures
export const test = base.extend<MyFixtures>({
    loginPage: async ({ page }, use) => {
        // Instancia a página uma vez e passa para o teste
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },
});

export { expect } from '@playwright/test';