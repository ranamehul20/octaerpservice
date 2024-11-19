import express from "express";
import {verifyToken,createLogger} from "../utils/validator.js";
import { list } from "../controllers/MaintenanceController.js";
const router = express.Router();


router.get('/list',[verifyToken,createLogger],list);

export default router;