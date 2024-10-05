import express from "express";
import { listingCities, listingStates,listingCountries,listingSociety } from "../controllers/SettingsController.js";
const router = express.Router();


router.get('/city',listingCities);
router.get('/state',listingStates);
router.get('/country',listingCountries);
router.get('/societies',listingSociety);

export default router;