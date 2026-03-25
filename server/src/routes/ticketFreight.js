import express from 'express';
import { 
  createFreight, getFreight, updateFreight, deleteFreight
} from '../controllers/freight.controller.js';
import { authenticate, checkPermission } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/freights:
 *   post:
 *     summary: Cria registro de frete
 *     tags: [Freights]
 */
router.post('/', authenticate, checkPermission('freight'), createFreight);

/**
 * @openapi
 * /api/freights:
 *   get:
 *     summary: Retorna lista de fretes
 *     tags: [Freights]
 */
router.get('/', authenticate, checkPermission('freight'), getFreight);

/**
 * @openapi
 * /api/freights/{id}:
 *   put:
 *     summary: Atualiza registro de frete
 *     tags: [Freights]
 */
router.put('/:id', authenticate, checkPermission('freight'), updateFreight);

/**
 * @openapi
 * /api/freights/{id}:
 *   delete:
 *     summary: Exclui registro de frete
 *     tags: [Freights]
 */
router.delete('/:id', authenticate, checkPermission('freight'), deleteFreight);

export default router;