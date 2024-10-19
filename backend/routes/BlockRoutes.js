import express from "express";
import {verifyToken} from "../utils/validator.js";
import { createBlock,listingBlocks,getBlockDetails,updateBlocks } from "../controllers/BlockMstController.js";
const router = express.Router();


router.post('/',verifyToken,createBlock);
router.get('/',verifyToken,listingBlocks);
router.post('/:id',verifyToken,updateBlocks);
router.get('/:id',verifyToken,getBlockDetails);


export default router;