import express from "express";
import {verifyToken} from "../utils/validator.js";
import { list } from "../controllers/MaintenanceController.js";
const router = express.Router();


router.get('/list',verifyToken,list);

export default router;