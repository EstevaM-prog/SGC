import prisma from '../db.js';

export const getTrashByResource = async (req, res) => {
  try {
    const { recurso } = req.params;
    let items = [];

    switch (recurso) {
      case 'chamados':
        items = await prisma.chamado.findMany({
          where: { deleted: true },
          orderBy: { deletedAt: 'desc' }
        });
        break;
      case 'shopping':
        items = await prisma.shoppingTicket.findMany({
          where: { deleted: true },
          orderBy: { deletedAt: 'desc' }
        });
        break;
      case 'freight':
        items = await prisma.freightTicket.findMany({
          where: { deleted: true },
          orderBy: { deletedAt: 'desc' }
        });
        break;
      default:
        return res.status(400).json({ error: 'Recurso de lixeira inválido' });
    }

    res.json(items);
  } catch (error) {
    console.error(`Erro ao buscar lixeira de ${req.params.recurso}:`, error);
    res.status(500).json({ error: 'Erro ao buscar lixeira' });
  }
};
