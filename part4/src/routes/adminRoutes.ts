import express, { Request, Response } from 'express';
import { admin, saleInfo, confirmSale, cancelSale } from '../controllers/adminController';

const router = express.Router();

router.get('/', admin);

router.post('/confirm', confirmSale);
router.get('/cancel', cancelSale);



router.get('/saleInfo', saleInfo);

export default router;