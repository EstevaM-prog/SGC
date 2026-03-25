import prisma from '../db.js';

export const createChamados = async (req, res) => {
  try {
    const data = req.body;
    const chamado = await prisma.chamado.create({
      data: {
        situacao: data.situacao || "ABERTO",
        numero: data.numero,
        dataEmissao: data.dataEmissao ? new Date(data.dataEmissao) : null,
        pedido: data.pedido,
        notaFiscal: data.notaFiscal,
        vencimento: data.vencimento ? new Date(data.vencimento) : null,
        valor: parseFloat(data.valor) || 0,
        forma: data.forma,
        razao: data.razao,
        cnpj: data.cnpj,
        setor: data.setor,
        codEtica: data.codEtica || "nao",
        requisitante: data.requisitante,
        obs: data.obs,
        deleted: false
      }
    });
    res.status(201).json(chamado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar chamado' });
  }
};

export const getChamados = async (req, res) => {
  try {
    const items = await prisma.chamado.findMany({
      where: { deleted: false },
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar chamados' });
  }
};

export const updateChamados = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const chamado = await prisma.chamado.update({
      where: { id },
      data: {
        ...data,
        dataEmissao: data.dataEmissao ? new Date(data.dataEmissao) : undefined,
        vencimento: data.vencimento ? new Date(data.vencimento) : undefined,
      }
    });
    res.json(chamado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar chamado' });
  }
};

export const deleteChamados = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.chamado.update({
      where: { id },
      data: { deleted: true, deletedAt: new Date() }
    });
    res.json({ message: 'Chamado movido para a lixeira' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar chamado' });
  }
};

export default {
    createChamados,
    getChamados,
    updateChamados,
    deleteChamados
};