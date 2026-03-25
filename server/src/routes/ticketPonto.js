import express from 'express';
import { 
  createPonto, getPonto, updatePonto, deletePonto 
} from '../controllers/ponto.controller.js';
import { authenticate, checkPermission } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/ponto:
 *   post:
 *     summary: Cria registro de ponto
 *     tags: [Ponto]
 */
router.post('/', authenticate, checkPermission('ponto'), createPonto);

/**
 * @openapi
 * /api/ponto:
 *   get:
 *     summary: Retorna lista de batidas de ponto
 *     tags: [Ponto]
 */
router.get('/', authenticate, checkPermission('ponto'), getPonto);

/**
 * @openapi
 * /api/ponto/{id}:
 *   put:
 *     summary: Atualiza registro de ponto
 *     tags: [Ponto]
 */
router.put('/:id', authenticate, checkPermission('ponto'), updatePonto);

/**
 * @openapi
 * /api/ponto/{id}:
 *   delete:
 *     summary: Exclui (soft delete) registro de ponto
 *     tags: [Ponto]
 */
router.delete('/:id', authenticate, checkPermission('ponto'), deletePonto);

export default router;