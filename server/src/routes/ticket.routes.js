import express from 'express';
import { getTickets, createTicket, updateTicket, deleteTicket } from '../controllers/ticketPonto.js';

const router = express.Router();

/**
 * @openapi
 * /api/tickets:
 *   get:
 *     description: Retorna a lista de chamados
 *     responses:
 *       200:
 *         description: Sucesso
 */
router.get('/', getTickets);

/**
 * @openapi
 * /api/tickets:
 *   post:
 *     description: Cria um novo chamado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               situacao:
 *                 type: string
 *               numero:
 *                 type: string
 *               dataEmissao:
 *                 type: string
 *                 format: date-time
 *               pedido:
 *                 type: string
 *               notaFiscal:
 *                 type: string
 *               vencimento:
 *                 type: string
 *                 format: date-time
 *               valor:
 *                 type: number
 *               forma:
 *                 type: string
 *               razao:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               setor:
 *                 type: string
 *               codEtica:
 *                 type: string
 *               requisitante:
 *                 type: string
 *               obs:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chamado criado
 */
router.post('/', createTicket);

/**
 * @openapi
 * /api/tickets/{id}:
 *   put:
 *     description: Atualiza um chamado
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               situacao:
 *                 type: string
 *               numero:
 *                 type: string
 *               dataEmissao:
 *                 type: string
 *                 format: date-time
 *               pedido:
 *                 type: string
 *               notaFiscal:
 *                 type: string
 *               vencimento:
 *                 type: string
 *                 format: date-time
 *               valor:
 *                 type: number
 *               forma:
 *                 type: string
 *               razao:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               setor:
 *                 type: string
 *               codEtica:
 *                 type: string
 *               requisitante:
 *                 type: string
 *               obs:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chamado atualizado
 */
router.put('/:id', updateTicket);

/**
 * @openapi
 * /api/tickets/{id}:
 *   delete:
 *     description: Deleta um chamado (soft delete)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chamado deletado
 */
router.delete('/:id', deleteTicket);

export default router;