import { PostJob, getalljob, getjobbyId, getadminjobs} from '../controllers/job.controller.js'
import express from "express";
const router = express.Router();
import isAuthentication from "../middleware/isAuthenticaton.js";

router.route('/post').post(isAuthentication,PostJob);
router.route('/get').get(getalljob);
router.route('/getjobbyId/:id').get(isAuthentication,getjobbyId);
router.route('/getadminjobs').get(isAuthentication, getadminjobs);

export default router;
