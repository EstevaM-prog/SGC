// Importa comandos personalizados (opcional)
// import './commands';

// Configurações globais para os testes E2E
Cypress.on('uncaught:exception', (err, runnable) => {
  // Impede que o Cypress falhe o teste se houver um erro não capturado no site (comum em dev)
  return false;
});
