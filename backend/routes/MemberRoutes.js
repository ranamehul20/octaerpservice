import express from "express";
import {verifyToken,createLogger} from "../utils/validator.js";
import { ListMembers,UpdateDetails,GetUserDetails } from "../controllers/UserController.js";
const router = express.Router();


router.get('/',[verifyToken,createLogger],ListMembers);
router.post('/:id',[verifyToken,createLogger],UpdateDetails);
router.get('/:id',[verifyToken,createLogger],GetUserDetails);



export default router;