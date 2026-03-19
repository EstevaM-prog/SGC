import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTickets = async (req, res) => {
  try {
    const tickets = await prisma.chamado.findMany({
      where: { deleted: false },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar chamados' });
  }
};

export const createTicket = async (req, res) => {
  try {
    const ticketData = req.body;
    const ticket = await prisma.chamado.create({
      data: ticketData
    });
    res.status(201).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar chamado' });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticketData = req.body;
    const ticket = await prisma.chamado.update({
      where: { id },
      data: ticketData
    });
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar chamado' });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.chamado.update({
      where: { id },
      data: { deleted: true, deletedAt: new Date() }
    });
    res.json({ message: 'Chamado deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar chamado' });
  }
};