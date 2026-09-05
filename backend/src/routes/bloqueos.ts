import { Router } from 'express';
import * as bloqueoController from '../controllers/bloqueoController';
import { autenticar } from '../middlewares/autenticacion';

const router = Router();

router.use(autenticar);

router.get('/', bloqueoController.listar);
router.post('/', bloqueoController.crear);

export default router;
