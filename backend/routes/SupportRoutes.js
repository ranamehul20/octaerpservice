import express from "express";
import {verifyToken,createLogger} from "../utils/validator.js";
import { createSupport,listSupport,updateSupport } from "../controllers/SupportController.js";
const router = express.Router();


router.post('/',[verifyToken,createLogger],createSupport);
router.get('/',[verifyToken,createLogger],listSupport);
router.post('/update/:id',[verifyToken,createLogger],updateSupport);


export default router;