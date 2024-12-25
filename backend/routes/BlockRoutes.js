import express from "express";
import {verifyToken,createLogger} from "../utils/validator.js";
import { createBlock,listingBlocks,getBlockDetails,updateBlocks } from "../controllers/BlockMstController.js";
const router = express.Router();


router.post('/',[verifyToken,createLogger],createBlock);
router.get('/',[verifyToken,createLogger],listingBlocks);
router.post('/:id',[verifyToken,createLogger],updateBlocks);
router.get('/:id',[verifyToken,createLogger],getBlockDetails);


export default router;