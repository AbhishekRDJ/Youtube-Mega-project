import Router from 'express'
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getPlans, subscribe, getSubscriptionStatus } from "../controller/subscription.controller.js";

const router = Router();

router.get('/plans', getPlans);
router.post('/subscribe', verifyJWT, subscribe);
router.get('/status', verifyJWT, getSubscriptionStatus);

export default router;


