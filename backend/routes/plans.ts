import { Router } from 'express';
import { plansController } from '../controllers/plansController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Toutes les routes sont protégées
router.use(authenticate);

router.get('/', plansController.getAll);
router.get('/:id', plansController.getById);
router.post('/', plansController.create);
router.put('/:id', plansController.update);
router.delete('/:id', plansController.delete);

export default router;
