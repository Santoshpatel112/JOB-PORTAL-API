import { register, Logout, Login, Updateprofile } from "../controllers/user.controller.js";
import isAuthentication from "../middleware/isAuthenticaton.js";
import express from "express";
const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(Login);
router.route('/logout').get(isAuthentication, Logout);
router.route('/profile/updateprofile').patch(isAuthentication, Updateprofile);

export default router;