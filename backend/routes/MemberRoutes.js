import express from "express";
import {verifyToken,createLogger} from "../utils/validator.js";
import { ListMembers,UpdateDetails,GetUserDetails,DeleteMember } from "../controllers/UserController.js";
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();


router.get('/',[verifyToken,createLogger],ListMembers);
router.post('/edit/:id',[verifyToken,createLogger,upload.single('photo')],UpdateDetails);
router.get('/:id',[verifyToken,createLogger],GetUserDetails);
router.get('/delete/:id',[verifyToken,createLogger],DeleteMember);



export default router;