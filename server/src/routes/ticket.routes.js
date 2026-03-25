import express from 'express';
import { getChamados, createChamados, updateChamados, deleteChamados, restoreChamados, permanentDeleteChamados } from '../controllers/chamados.controller.js';
import { authenticate, checkPermission } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/tickets:
 *   get:
 *     description: Retorna a lista de chamados
 */
router.get('/', authenticate, checkPermission('list'), getChamados);

/**
 * @openapi
 * /api/tickets:
 *   post:
 *     description: Cria um novo chamado
 */
router.post('/', authenticate, checkPermission('list'), createChamados);

/**
 * @openapi
 * /api/tickets/{id}:
 *   put:
 *     description: Atualiza um chamado
 */
router.put('/:id', authenticate, checkPermission('list'), updateChamados);

/**
 * @openapi
 * /api/tickets/{id}:
 *   delete:
 *     description: Deleta um chamado (soft delete)
 */
router.delete('/:id', authenticate, checkPermission('list'), deleteChamados);

// Novas rotas de Lixeira
router.post('/:id/restore', authenticate, checkPermission('list'), restoreChamados);
router.delete('/:id/permanent', authenticate, checkPermission('list'), permanentDeleteChamados);


export default router;