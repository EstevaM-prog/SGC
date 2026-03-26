import express from 'express';
import { 
  createFreight,
  getFreight,
  updateFreight,
  deleteFreight,
  restoreFreight,
  permanentDeleteFreight,
  getTrashFreight
} from '../controllers/freight.controller.js';

const router = express.Router();

router.post('/', createFreight);
router.get('/', getFreight);
router.get('/lixeira', getTrashFreight);
router.put('/:id', updateFreight);
router.patch('/:id/restore', restoreFreight);
router.delete('/:id', deleteFreight); // Soft delete
router.delete('/:id/hard', permanentDeleteFreight);

export default router;