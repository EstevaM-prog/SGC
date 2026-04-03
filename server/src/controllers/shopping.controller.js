import prisma from '../db.js';

export const createShopping = async (req, res) => {
  try {
    const data = req.body;
    const shopping = await prisma.shoppingTicket.create({
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
    res.status(201).json(shopping);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar ticket de compra' });
  }
};

export const getShopping = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 200; 
    const page = req.query.page ? parseInt(req.query.page) : null;

    if (page) {
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        prisma.shoppingTicket.findMany({
          where: { deleted: false },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.shoppingTicket.count({ where: { deleted: false } })
      ]);
      return res.json({
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    }

    const items = await prisma.shoppingTicket.findMany({
      where: { deleted: false },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar compras' });
  }
};

export const updateShopping = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const shopping = await prisma.shoppingTicket.update({
      where: { id },
      data: {
        ...data,
        prazoEntrega: data.prazoEntrega ? new Date(data.prazoEntrega) : undefined,
        prazoPagto: data.prazoPagto ? new Date(data.prazoPagto) : undefined,
      }
    });
    res.json(shopping);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
};

export const deleteShopping = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.shoppingTicket.update({
      where: { id },
      data: { deleted: true, deletedAt: new Date() }
    });
    res.json({ message: 'Registro excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir' });
  }
};

export const restoreShopping = async (req, res) => {
  try {
    const { id } = req.params;
    const shopping = await prisma.shoppingTicket.update({
      where: { id },
      data: { deleted: false, deletedAt: null }
    });
    res.json(shopping);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao restaurar compra' });
  }
};

export const permanentDeleteShopping = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.shoppingTicket.delete({
      where: { id }
    });
    res.json({ message: 'Compra removida permanentemente' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir definitivamente' });
  }
};

export const getTrashShopping = async (req, res) => {
  try {
    const items = await prisma.shoppingTicket.findMany({
      where: { deleted: true },
      orderBy: { deletedAt: 'desc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar lixeira de compras' });
  }
};

export default {
    createShopping,
    getShopping,
    updateShopping,
    deleteShopping,
    restoreShopping,
    permanentDeleteShopping,
    getTrashShopping
};