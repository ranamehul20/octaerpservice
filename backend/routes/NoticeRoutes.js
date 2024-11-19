import express from "express";
import {verifyToken,createLogger} from "../utils/validator.js";
import { create, update, list } from "../controllers/NoticeMstController.js";
const router = express.Router();

router.post('/',[verifyToken,createLogger],create);
router.get('/',[verifyToken,createLogger],list);
router.post('/:id',[verifyToken,createLogger],update);
export default router;