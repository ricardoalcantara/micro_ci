import express, { Router } from "express";
import HealthCheckRouter from "../controllers/HealthCheck";
import WebHookRouter from "../controllers/WebHook";

const router: Router = express.Router();
router.use("/health", HealthCheckRouter);
router.use("/webhook", WebHookRouter);

export default router;
