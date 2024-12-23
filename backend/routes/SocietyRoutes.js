import express from "express";
import {verifyToken,createLogger} from "../utils/validator.js";
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
  
router.post('/',[upload.single('logo'),verifyToken,createLogger],createSociety);
router.get('/',[verifyToken,createLogger],listingSociety);
router.post('/:id',[upload.single('logo'),verifyToken,createLogger],updateSociety);
router.get('/:id',[verifyToken,createLogger],SocietyDetail);

export default router;