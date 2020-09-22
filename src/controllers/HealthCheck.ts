import express, { Request, Response, Router } from "express";

const router: Router = express.Router();

export const status = (req: Request, res: Response) => {
    res.status(200).send({ j: "status"});
};

router.get("/status", status);

export default router;
