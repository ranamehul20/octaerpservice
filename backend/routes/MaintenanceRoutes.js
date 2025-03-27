import express from "express";
import {verifyToken,createLogger} from "../utils/validator.js";
import { list,getDetails,duplicateMaintenance } from "../controllers/MaintenanceController.js";
const router = express.Router();


router.get('/list',[verifyToken,createLogger],list);
router.get('/:id',[verifyToken,createLogger],getDetails);
router.post('/create-maintaince',[verifyToken,createLogger],duplicateMaintenance);

export default router;