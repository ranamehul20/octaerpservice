import express from "express";
import {verifyToken,createLogger} from "../utils/validator.js";
import { listingCities, listingStates,listingCountries,listingSociety,staticValues,testCron,listingHouse,listingBlocks } from "../controllers/SettingsController.js";
const router = express.Router();


router.get('/city',[verifyToken,createLogger],listingCities);
router.get('/state',[verifyToken,createLogger],listingStates);
router.get('/country',[verifyToken,createLogger],listingCountries);
router.get('/societies',[verifyToken,createLogger],listingSociety);
router.post('/houses',[verifyToken,createLogger],listingHouse);
router.get('/blocks',[verifyToken,createLogger],listingBlocks);
router.get('/staticvalue',[verifyToken,createLogger],staticValues);
router.get('/testcron',testCron)

export default router;