import express from "express";
import {verifyToken,createLogger} from "../utils/validator.js";
import { createHouse, listingHouses,houseDetails,updateHouses } from "../controllers/HouseMstController.js";
const router = express.Router();

router.post('/',[verifyToken,createLogger],createHouse);
router.get('/',[verifyToken,createLogger],listingHouses);
router.post('/:id',[verifyToken,createLogger],updateHouses);
router.get('/:id',[verifyToken,createLogger],houseDetails);
export default router;