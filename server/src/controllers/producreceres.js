import prisma from '../db.js';

export const createProdureceres = async (req, res) => {
  try {
    const { titulo, descricao, categoria, icon } = req.body;
    const procedure = await prisma.procedimento.create({
      data: {
        titulo,
        descricao,
        categoria,
        icon
      }
    });
    res.status(201).json(procedure);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar procedimento' });
  }
};

export const getProdureceres = async (req, res) => {
  try {
    const items = await prisma.procedimento.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar procedimentos' });
  }
};

export const updateProdureceres = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const procedure = await prisma.procedimento.update({
      where: { id },
      data
    });
    res.json(procedure);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar procedimento' });
  }
};

export const deleteProdureceres = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.procedimento.delete({
      where: { id }
    });
    res.json({ message: 'Procedimento excluído' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir' });
  }
};

export default {
    createProdureceres,
    getProdureceres,
    updateProdureceres,
    deleteProdureceres
};