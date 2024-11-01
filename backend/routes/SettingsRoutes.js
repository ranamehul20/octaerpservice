import express from "express";
import {verifyToken} from "../utils/validator.js";
import { listingCities, listingStates,listingCountries,listingSociety,staticValues,testCron } from "../controllers/SettingsController.js";
const router = express.Router();


router.get('/city',verifyToken,listingCities);
router.get('/state',verifyToken,listingStates);
router.get('/country',verifyToken,listingCountries);
router.get('/societies',verifyToken,listingSociety);
router.get('/staticvalue',verifyToken,staticValues);
router.get('/testcron',testCron)

export default router;