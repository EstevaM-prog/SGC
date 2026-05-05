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
    res.status(201).json({ 
      data: chamado, 
      message: 'Chamado criado com sucesso!' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar chamado' });
  }
};

export const getChamados = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 200; 
    const page = req.query.page ? parseInt(req.query.page) : null;

    if (page) {
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        prisma.chamado.findMany({
          where: { deleted: false },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.chamado.count({ where: { deleted: false } })
      ]);
      return res.json({
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    }

    const items = await prisma.chamado.findMany({
      where: { deleted: false },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar chamados' });
  }
};

export const updateChamados = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    
    // Filtramos apenas campos que foram enviados no body para permitir updates parciais (ex: apenas situacao)
    const updateData = {};
    const fields = [
      'situacao', 'numero', 'pedido', 'notaFiscal', 'forma', 
      'razao', 'cnpj', 'setor', 'codEtica', 'requisitante', 'obs'
    ];

    fields.forEach(field => {
      if (data[field] !== undefined) updateData[field] = data[field];
    });

    if (data.valor !== undefined && data.valor !== null) {
      updateData.valor = parseFloat(data.valor);
    }

    if (data.dataEmissao) updateData.dataEmissao = new Date(data.dataEmissao);
    if (data.vencimento) updateData.vencimento = new Date(data.vencimento);

    const chamado = await prisma.chamado.update({
      where: { id },
      data: updateData
    });

    res.json({ 
      data: chamado, 
      message: 'Chamado atualizado com sucesso!' 
    });
  } catch (error) {
    console.error('Erro no update:', error);
    res.status(500).json({ error: 'Erro ao atualizar chamado' });
  }
};

export const deleteChamados = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.chamado.update({
      where: { id },
      data: { deleted: true, deletedAt: new Date() }
    });
    res.json({ message: 'Chamado movido para a lixeira com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar chamado' });
  }
};

export const restoreChamados = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const chamado = await prisma.chamado.update({
      where: { id },
      data: { deleted: false, deletedAt: null }
    });
    res.json({ 
      data: chamado, 
      message: 'Chamado restaurado com sucesso!' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao restaurar chamado' });
  }
};

export const permanentDeleteChamados = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.chamado.delete({
      where: { id }
    });
    res.json({ message: 'Chamado removido permanentemente!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir definitivamente' });
  }
};

export const getTrashChamados = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 200;
    
    const items = await prisma.chamado.findMany({
      where: { deleted: true },
      orderBy: { deletedAt: 'desc' },
      take: limit
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar lixeira de chamados' });
  }
};

export default {
    createChamados,
    getChamados,
    updateChamados,
    deleteChamados,
    restoreChamados,
    permanentDeleteChamados
};