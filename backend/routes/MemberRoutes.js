import express from "express";
import { ListMembers } from "../controllers/UserController.js";
const router = express.Router();


router.get('/',ListMembers);



export default router;