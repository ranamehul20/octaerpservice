import express from "express";
import {verifyToken} from "../utils/validator.js";
import { Register,Login, Logout,Check,AdminLogin,ListMembers,TestEmails, ChangePassword } from "../controllers/UserController.js";
const router = express.Router();


router.post('/register',verifyToken,Register);
router.post('/admin',Register);
router.post('/login',Login);
router.post('/adminlogin',AdminLogin);
router.post('/logout',Logout);
router.get('/check',Check);
router.get('/',verifyToken,ListMembers);
router.get('/testmail',TestEmails);
router.post('/changepassword',verifyToken,ChangePassword);



export default router;