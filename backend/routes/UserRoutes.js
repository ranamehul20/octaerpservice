import express from "express";
import {verifyToken,createLogger} from "../utils/validator.js";
import { Register,Login, Logout,Check,AdminLogin,ListMembers,TestEmails, ChangePassword,forgotPassword,resetPassword } from "../controllers/UserController.js";
const router = express.Router();


router.post('/register',[verifyToken,createLogger],Register);
router.post('/admin',createLogger,Register);
router.post('/login',createLogger,Login);
router.post('/adminlogin',createLogger,AdminLogin);
router.post('/logout',createLogger,Logout);
router.get('/check',createLogger,Check);
router.get('/',[verifyToken,createLogger],ListMembers);
router.get('/testmail',TestEmails);
router.post('/change-password',[verifyToken,createLogger],ChangePassword);
router.post('/forgot-password',createLogger,forgotPassword);
router.post('/reset-password/:token',createLogger,resetPassword)



export default router;