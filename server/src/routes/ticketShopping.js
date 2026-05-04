import express from 'express';
import { 
  createShopping,
  getShopping,
  updateShopping,
  deleteShopping,
  restoreShopping,
  permanentDeleteShopping,
  getTrashShopping
} from '../controllers/shopping.controller.js';

const router = express.Router();

router.post('/', createShopping);
router.get('/', getShopping);
router.get('/lixeira', getTrashShopping);
router.put('/:id', updateShopping);
router.patch('/:id/restore', restoreShopping);
router.delete('/:id', deleteShopping); // Soft delete
router.delete('/:id/hard', permanentDeleteShopping);

export default router;