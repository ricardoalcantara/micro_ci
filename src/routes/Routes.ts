import express, { Router } from "express";
import * as HealthCheck from "../controllers/HealthCheck";
import * as WebHook from "../controllers/WebHook";

const router: Router = express.Router();
router.get("/health", HealthCheck.status);
router.get("/webhook", WebHook.get);

export default router;
