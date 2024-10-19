import express from "express";
import {verifyToken} from "../utils/validator.js";
import { createHouse, listingHouses,houseDetails,updateHouses } from "../controllers/HouseMstController.js";
const router = express.Router();

router.post('/',verifyToken,createHouse);
router.get('/',verifyToken,listingHouses);
router.post('/:id',verifyToken,updateHouses);
router.get('/:id',verifyToken,houseDetails);
export default router;