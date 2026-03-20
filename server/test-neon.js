import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando teste de conexão com Neon DB...');
  
  try {
    // 1. Tentar ler (deve estar vazio)
    const usersCount = await prisma.user.count();
    console.log(`📊 Total de usuários atuais: ${usersCount}`);

    // 2. Criar um usuário de teste
    const testEmail = `test-${Date.now()}@example.com`;
    console.log(`📝 Criando usuário de teste: ${testEmail}`);
    
    const newUser = await prisma.user.create({
      data: {
        name: 'Usuário de Teste Neon',
        email: testEmail,
        password: 'password123',
      },
    });

    console.log('✅ Usuário criado com sucesso no Neon!');
    console.log(newUser);

    // 3. Deletar o usuário de teste para limpar o banco (opcional, mas bom para teste)
    // await prisma.user.delete({ where: { id: newUser.id } });
    // console.log('🗑️ Usuário de teste removido.');

  } catch (error) {
    console.error('❌ Erro no teste do Neon DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
