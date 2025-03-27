import express from "express";
import {verifyToken,createLogger} from "../utils/validator.js";
import { createFeedback,listingFeedback } from "../controllers/FeedbackController.js";
const router = express.Router();


router.post('/',[verifyToken,createLogger],createFeedback);
router.get('/',[verifyToken,createLogger],listingFeedback);
// router.get('/:id',[verifyToken,createLogger],getFeedbackDetails);
// router.post('/edit/:id',[verifyToken,createLogger],updateFeedback);


export default router;