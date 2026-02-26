import { Page } from '@playwright/test';

export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Métodos comuns a todas as páginas
    async goto(path: string) {
        await this.page.goto(path);
    }
}