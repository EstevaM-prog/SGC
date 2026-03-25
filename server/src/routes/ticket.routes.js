import express from 'express';
import { getTickets, createTicket, updateTicket, deleteTicket } from '../controllers/ticketPonto.js';
import { authenticate, checkPermission } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/tickets:
 *   get:
 *     description: Retorna a lista de chamados
 */
router.get('/', authenticate, checkPermission('list'), getTickets);

/**
 * @openapi
 * /api/tickets:
 *   post:
 *     description: Cria um novo chamado
 */
router.post('/', authenticate, checkPermission('list'), createTicket);

/**
 * @openapi
 * /api/tickets/{id}:
 *   put:
 *     description: Atualiza um chamado
 */
router.put('/:id', authenticate, checkPermission('list'), updateTicket);

/**
 * @openapi
 * /api/tickets/{id}:
 *   delete:
 *     description: Deleta um chamado (soft delete)
 */
router.delete('/:id', authenticate, checkPermission('list'), deleteTicket);

export default router;