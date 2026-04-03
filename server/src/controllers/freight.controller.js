import prisma from '../db.js';

export const createFreight = async (req, res) => {
  try {
    const data = req.body;
    const freight = await prisma.freightTicket.create({
      data: {
        situacao: data.situacao || "ABERTO",
        numero: data.numero,
        solicitacao: data.solicitacao,
        pedido: data.pedido,
        prazoEntrega: data.prazoEntrega ? new Date(data.prazoEntrega) : null,
        valor: parseFloat(data.valor) || 0,
        prazoPagto: data.prazoPagto ? new Date(data.prazoPagto) : null,
        razao: data.razao,
        cnpj: data.cnpj,
        requisitante: data.requisitante,
        obs: data.obs,
        deleted: false
      }
    });
    res.status(201).json(freight);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar ticket de frete' });
  }
};

export const getFreight = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 200; 
    const page = req.query.page ? parseInt(req.query.page) : null;

    if (page) {
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        prisma.freightTicket.findMany({
          where: { deleted: false },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.freightTicket.count({ where: { deleted: false } })
      ]);
      return res.json({
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    }

    const items = await prisma.freightTicket.findMany({
      where: { deleted: false },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar fretes' });
  }
};

export const updateFreight = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const freight = await prisma.freightTicket.update({
      where: { id },
      data: {
        ...data,
        prazoEntrega: data.prazoEntrega ? new Date(data.prazoEntrega) : undefined,
        prazoPagto: data.prazoPagto ? new Date(data.prazoPagto) : undefined,
      }
    });
    res.json(freight);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar frete' });
  }
};

export const deleteFreight = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.freightTicket.update({
      where: { id },
      data: { deleted: true, deletedAt: new Date() }
    });
    res.json({ message: 'Registro de frete excluído' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir frete' });
  }
};

export const restoreFreight = async (req, res) => {
  try {
    const { id } = req.params;
    const freight = await prisma.freightTicket.update({
      where: { id },
      data: { deleted: false, deletedAt: null }
    });
    res.json(freight);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao restaurar frete' });
  }
};

export const permanentDeleteFreight = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.freightTicket.delete({
      where: { id }
    });
    res.json({ message: 'Frete removido permanentemente' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir definitivamente' });
  }
};

export const getTrashFreight = async (req, res) => {
  try {
    const items = await prisma.freightTicket.findMany({
      where: { deleted: true },
      orderBy: { deletedAt: 'desc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar lixeira de fretes' });
  }
};

export default {
    createFreight,
    getFreight,
    updateFreight,
    deleteFreight,
    restoreFreight,
    permanentDeleteFreight,
    getTrashFreight
};