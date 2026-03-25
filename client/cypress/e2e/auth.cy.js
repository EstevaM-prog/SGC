describe('Autenticação de Usuário (E2E)', () => {
  beforeEach(() => {
    // Acessa a página de landing/login
    cy.visit('/');
    // Se tiver no landing, clica pra entrar no login
    cy.contains('Acessar').click({ force: true });
  });

  it('Deve mostrar erro ao tentar logar com credenciais erradas', () => {
    cy.get('#login-email').type('usuario@erro.com');
    cy.get('#login-password').type('senha123');
    cy.get('.auth-btn-primary').click();

    // Verifica se aparece o alerta de erro
    cy.get('.auth-error').should('be.visible');
    cy.contains('E-mail ou senha incorretos').should('exist');
  });

  it('Deve conseguir logar com sucesso', () => {
    // Use dados válidos que existam no seu banco local/mock
    cy.get('#login-email').type('test@admin.com'); 
    cy.get('#login-password').type('sua_senha_real');
    cy.get('.auth-btn-primary').click();

    // Deve ser redirecionado para o Dashboard
    cy.url().should('include', '/');
    cy.contains('Dashboard').should('be.visible');
  });
});
