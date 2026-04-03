import prisma from '../db.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const { period } = req.query; // 'Today', 'Week', 'Month', 'Year'
    
    // Configute date filter if requested
    const now = new Date();
    let startDate = null;
    
    if (period === 'Today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'Week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'Month') {
      startDate = new Date(now.setDate(now.getDate() - 30));
    } else if (period === 'Year') {
      startDate = new Date(now.setDate(now.getDate() - 365));
    }

    const whereClause = { deleted: false };
    if (startDate) {
      whereClause.updatedAt = { gte: startDate };
    }

    // Usar Promise.all para disparar TODAS as queries no banco SIMULTANEAMENTE!
    // Sem gargalos de "await" lineares. (Resolve o #3 e o #2)
    const [
      chamadosTotal, chamadosGroup, chamadosSoma,
      shoppingTotal, shoppingGroup, shoppingSoma,
      freightTotal, freightGroup, freightSoma
    ] = await Promise.all([
      prisma.chamado.count({ where: whereClause }),
      prisma.chamado.groupBy({ by: ['situacao'], where: whereClause, _count: true }),
      prisma.chamado.aggregate({ where: whereClause, _sum: { valor: true } }),
      
      prisma.shoppingTicket.count({ where: whereClause }),
      prisma.shoppingTicket.groupBy({ by: ['situacao'], where: whereClause, _count: true }),
      prisma.shoppingTicket.aggregate({ where: whereClause, _sum: { valor: true } }),
      
      prisma.freightTicket.count({ where: whereClause }),
      prisma.freightTicket.groupBy({ by: ['situacao'], where: whereClause, _count: true }),
      prisma.freightTicket.aggregate({ where: whereClause, _sum: { valor: true } })
    ]);

    // Função auxiliar para juntar status com segurança
    const sumGasto = (chamadosSoma._sum?.valor || 0) + (shoppingSoma._sum?.valor || 0) + (freightSoma._sum?.valor || 0);
    const totalTickets = chamadosTotal + shoppingTotal + freightTotal;

    // Agregando contagem de forma global a partir das tabelas agrupadas
    const rawStatus = {};
    const processGroup = (group) => {
      group.forEach(g => {
        const name = (g.situacao || 'Desconhecido').toLowerCase();
        rawStatus[name] = (rawStatus[name] || 0) + g._count;
      });
    };
    
    processGroup(chamadosGroup);
    processGroup(shoppingGroup);
    processGroup(freightGroup);

    // Extrair os exatos contadores que o front-end usa
    const solved = rawStatus['solucionado'] || 0;
    const open = totalTickets - solved;
    const escriturar = rawStatus['escriturar'] || 0;
    const processando = rawStatus['processando'] || 0;

    res.json({
      total: totalTickets,
      somaGastos: sumGasto,
      open,
      solved,
      escriturar,
      processando
    });
  } catch (error) {
    console.error("Erro no Dashboard Analytics:", error);
    res.status(500).json({ error: 'Erro ao gerar summary dashboard.' });
  }
};

export default { getDashboardSummary };
