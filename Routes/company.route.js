import express from "express";
import { Registercompany,  getCompany, getCompanybyId, Updatecompany } from "../controllers/company.controller.js";
import isAuthentication from "../middleware/isAuthenticaton.js";

const router = express.Router();

router.route('/register').post(isAuthentication, Registercompany);
router.route('/get').get(getCompany);
router.route('/get/:id').get(getCompanybyId);
router.route('/update/:id').patch(isAuthentication, Updatecompany);

export default router; 