import express from 'express';
import { 
  createShopping, getShopping, updateShopping, deleteShopping
} from '../controllers/shopping.controller.js';
import { authenticate, checkPermission } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @openapi
 * /api/shopping:
 *   post:
 *     summary: Cria registro de compras
 *     tags: [Shopping]
 */
router.post('/', authenticate, checkPermission('shopping'), createShopping);

/**
 * @openapi
 * /api/shopping:
 *   get:
 *     summary: Retorna lista de compras
 *     tags: [Shopping]
 */
router.get('/', authenticate, checkPermission('shopping'), getShopping);

/**
 * @openapi
 * /api/shopping/{id}:
 *   put:
 *     summary: Atualiza registro de compras
 *     tags: [Shopping]
 */
router.put('/:id', authenticate, checkPermission('shopping'), updateShopping);

/**
 * @openapi
 * /api/shopping/{id}:
 *   delete:
 *     summary: Exclui registro de compras
 *     tags: [Shopping]
 */
router.delete('/:id', authenticate, checkPermission('shopping'), deleteShopping);

export default router;