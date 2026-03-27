import prisma from '../db.js';

export const getPonto = async (req, res) => {
  try {
    const tickets = await prisma.ponto.findMany({
      where: { deleted: false },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar chamados' });
  }
};

export const createPonto = async (req, res) => {
  try {
    const ticketData = req.body;
    const ticket = await prisma.ponto.create({
      data: ticketData
    });
    res.status(201).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar chamado' });
  }
};

export const updatePonto = async (req, res) => {
  try {
    const { id } = req.params;
    const ticketData = req.body;
    const ticket = await prisma.ponto.update({
      where: { id },
      data: ticketData
    });
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar chamado' });
  }
};

export const deletePonto = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ponto.update({
      where: { id },
      data: { deleted: true, deletedAt: new Date() }
    });
    res.json({ message: 'Chamado deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar chamado' });
  }
};

export default {
  getPonto,
  createPonto,
  updatePonto,
  deletePonto
}