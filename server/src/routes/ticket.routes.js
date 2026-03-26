import express from 'express';
import { getChamados, createChamados, updateChamados, deleteChamados, restoreChamados, permanentDeleteChamados } from '../controllers/chamados.controller.js';
import { authenticate, checkPermission } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/tickets:
 *   get:
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: Retorna a lista de chamados
 */
router.get('/', authenticate, checkPermission('list'), getChamados);

/**
 * @openapi
 * /api/tickets:
 *   post:
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: Cria um novo chamado
 */
router.post('/', authenticate, checkPermission('list'), createChamados);

/**
 * @openapi
 * /api/tickets/{id}:
 *   put:
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: Atualiza um chamado
 */
router.put('/:id', authenticate, checkPermission('list'), updateChamados);

/**
 * @openapi
 * /api/tickets/{id}:
 *   delete:
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: Deleta um chamado (soft delete)
 */
router.delete('/:id', authenticate, checkPermission('list'), deleteChamados);

/**
 * @openapi
 * /api/tickets/{id}/restore:
 *   post:
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: Restaura um chamado da lixeira
 */
router.post('/:id/restore', authenticate, checkPermission('list'), restoreChamados);

/**
 * @openapi
 * /api/tickets/{id}/permanent:
 *   delete:
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: Exclui permanentemente um chamado
 */
router.delete('/:id/permanent', authenticate, checkPermission('list'), permanentDeleteChamados);


export default router;