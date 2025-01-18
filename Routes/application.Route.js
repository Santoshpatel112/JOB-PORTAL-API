import 
{
    applyjob, 
    getappliedjob, 
    getApplicant, 
    updateStatus
} from '../controllers/Application.controller.js';
import isAuthentication from '../middleware/isAuthenticaton.js';
import express from 'express';

const router = express.Router();

router.route('/apply/:id').get(isAuthentication, applyjob);
router.route('/get').get(isAuthentication, getappliedjob);
router.route('/:id/applicant').get(isAuthentication, getApplicant);
router.route('/status/:id/update').post(isAuthentication, updateStatus);

export default router;