import express from "express";
import { Register,Login, Logout,Check,AdminLogin } from "../controllers/UserController.js";
const router = express.Router();


router.post('/register',Register);
router.post('/login',Login);
router.post('/adminlogin',AdminLogin);
router.post('/logout',Logout);
router.get('/check',Check);



export default router;