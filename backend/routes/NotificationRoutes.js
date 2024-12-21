import express from "express";
import {verifyToken,createLogger} from "../utils/validator.js";
import {list } from "../controllers/NotificationController.js";
const router = express.Router();

router.get('/',[verifyToken,createLogger],list);
export default router;