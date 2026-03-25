import express from 'express';
import { 
  createProdureceres, getProdureceres, updateProdureceres, deleteProdureceres
} from '../controllers/producreceres.js';
import { authenticate, checkPermission } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/procedures:
 *   post:
 *     summary: Cria novo procedimento informativo
 *     tags: [Procedures]
 */
router.post('/', authenticate, checkPermission('procedures'), createProdureceres);

/**
 * @openapi
 * /api/procedures:
 *   get:
 *     summary: Retorna lista de procedimentos
 *     tags: [Procedures]
 */
router.get('/', authenticate, checkPermission('procedures'), getProdureceres);

/**
 * @openapi
 * /api/procedures/{id}:
 *   put:
 *     summary: Atualiza procedimento
 *     tags: [Procedures]
 */
router.put('/:id', authenticate, checkPermission('procedures'), updateProdureceres);

/**
 * @openapi
 * /api/procedures/{id}:
 *   delete:
 *     summary: Exclui procedimento
 *     tags: [Procedures]
 */
router.delete('/:id', authenticate, checkPermission('procedures'), deleteProdureceres);

export default router;