import express from 'express';
import { getTrashByResource } from '../controllers/trash.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/trash/{recurso}:
 *   get:
 *     tags: [Trash]
 *     security:
 *       - bearerAuth: []
 *     description: Lista itens deletados (Soft Delete) de um recurso específico (tickets, shopping, freights)
 *     parameters:
 *       - name: recurso
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [tickets, shopping, freights]
 */
router.get('/:recurso', authenticate, getTrashByResource);

export default router;
