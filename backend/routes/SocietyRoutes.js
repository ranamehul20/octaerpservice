import express from "express";
import {verifyToken} from "../utils/auth.js";
import { createSociety, listingSociety,updateSociety,SocietyDetail } from "../controllers/SocietyMstController.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
// Set up storage configuration for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'uploads/';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      console.log(dir);
      cb(null, dir); // Set the destination folder
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Rename the file to avoid conflicts
    },
  });


// Initialize multer with the storage configuration
const upload = multer({ storage });
  
router.post('/',[upload.single('logo'),verifyToken],createSociety);
router.get('/',verifyToken,listingSociety);
router.post('/:id',[upload.single('logo'),verifyToken],updateSociety);
router.get('/:id',verifyToken,SocietyDetail);

export default router;