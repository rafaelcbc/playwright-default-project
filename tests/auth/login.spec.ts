// ATENÇÃO: Importamos o `test` do nosso arquivo de fixtures, e não do '@playwright/test'
import { test, expect } from '../../fixtures/test-base';

test.describe('Autenticação de Usuários', () => {

    test('Deve realizar login com sucesso', async ({ loginPage, page }) => {
        await loginPage.goto('/login');
        await loginPage.doLogin('usuario@teste.com', 'senhaSegura123');

        // Validação usando web-first assertions
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    });

});