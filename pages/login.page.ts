import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page); // Chama o construtor da BasePage
        // Preferência sempre por locators voltados à acessibilidade (user-facing)
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