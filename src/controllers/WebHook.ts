import express, { Request, Response, Router } from "express";
import { Clone, Cred, CloneOptions } from "nodegit";
import Docker from "dockerode";
import tar, { CreateOptions, FileOptions } from "tar";
import path from "path";
import fs_old from "fs";
import rimraf from "rimraf";

const fs = fs_old.promises;

const router: Router = express.Router();

const tmpConf = {
  socketPath: process.env.MICRO_CI_SOCKET_PATH ?? (process.platform === "win32" ? "//./pipe/docker_engine" : "/var/run/docker.sock"),
  userName: process.env.MICRO_CI_USERNAME ?? "",
  password: process.env.MICRO_CI_PASSWORD ?? "",
  dataPath: process.env.MICRO_CI_DATA ?? ".cache"
};

if (!fs_old.existsSync(tmpConf.dataPath)) {
  fs.mkdir(tmpConf.dataPath);
}

export const get = (req: Request, res: Response) => {
    res.status(200).send({ j: "true" });
};

export const start = async (req: Request, res: Response) => {
    if (req.query.repository === undefined && req.query.repository === "")
    {
      return res.status(500).send({ j: "invalid repository" });
    }
    const repository: string = req.query.repository as string;
    console.log("Init - " + repository);

    const gitPath = path.join(tmpConf.dataPath, "gestao");
    const tarPath = path.join(tmpConf.dataPath, "gestao.tar");

    console.log("Cleaning files");
    rimraf.sync(gitPath);
    rimraf.sync(tarPath);

    const cloneOptions: CloneOptions = {};
    cloneOptions.fetchOpts = {
        callbacks: {
            certificateCheck: () => false,
            credentials: () => Cred.userpassPlaintextNew(tmpConf.userName, tmpConf.password),
        }
    };

    console.log("Cloning Repo");
    await Clone.clone(repository, gitPath, cloneOptions);

    const createOptions: CreateOptions & FileOptions = {
        file: tarPath,
        cwd: gitPath
    };

    console.log("Compressing Repo");
    const files = await fs.readdir(gitPath);

    await tar.create({ file: tarPath, cwd: gitPath }, files);

    console.log("Building docker");
    const docker = new Docker({ socketPath: tmpConf.socketPath });

    const stream = await docker.buildImage(tarPath, {t: ["microcl_gestao_5", "microcl_gestao_55"]});

    await new Promise((resolve, reject) => {
      docker.modem.followProgress(stream, onFinished, onProgress);

      function onFinished(err: any, output: any) {
        if (err) reject();
        else resolve();
      }
      function onProgress(event: any) {
        console.log(event);
      }
    });

    return res.status(200).send({ j: "done" });
};

router.get("/", get);
router.get("/start", start);

export default router;
