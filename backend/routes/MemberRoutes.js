import express from "express";
import {verifyToken} from "../utils/validator.js";
import { ListMembers,UpdateDetails,GetUserDetails } from "../controllers/UserController.js";
const router = express.Router();


router.get('/',verifyToken,ListMembers);
router.post('/:id',verifyToken,UpdateDetails);
router.get('/:id',verifyToken,GetUserDetails);



export default router;