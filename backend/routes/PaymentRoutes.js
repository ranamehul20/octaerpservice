import express from "express";
import {verifyToken,createLogger} from "../utils/validator.js";
import { createOrder,confirmPayment,payMaintenanceCash } from "../controllers/PaymentController.js";
const router = express.Router();


router.get('/create-order/:id',[verifyToken,createLogger],createOrder);
router.post('/confirm-payment',[verifyToken,createLogger],confirmPayment);
router.post('/confirm-cash-payment',[verifyToken,createLogger],payMaintenanceCash);

export default router;