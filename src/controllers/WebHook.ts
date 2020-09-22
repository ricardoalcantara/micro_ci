import express, { Request, Response, Router } from "express";


import { Clone, Cred, CloneOptions } from "nodegit";
import Docker from "dockerode";
import tar, { CreateOptions, FileOptions } from "tar";

const router: Router = express.Router();

export const get = (req: Request, res: Response) => {
    res.status(200).send({ j: "true" });
};

export const start = (req: Request, res: Response) => {
    const createOptions: CreateOptions & FileOptions = {
        file: "tarPath",
        cwd: "gitPath"
    };

    tar.create(createOptions, []);

    const cloneOptions: CloneOptions = {};
    cloneOptions.fetchOpts = {
        callbacks: {
            certificateCheck: () => false,
            credentials: () => Cred.userpassPlaintextNew(process.env.GIT_USER ?? "", process.env.GIT_PASS ?? ""),
        }
    };

    Clone.clone("", "gitPath", cloneOptions);

    const socketPath = process.env.SOCKET_PATH || (process.platform === "win32" ? "//./pipe/docker_engine" : " /var/run/docker.sock");

    console.log("Building docker");
    const docker: Docker = new Docker({ socketPath });

    res.status(200).send({ j: "true2" });
};

router.get("/", get);
router.get("/start", start);

export default router;
