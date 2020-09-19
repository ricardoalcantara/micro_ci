import express, { Application, Request, Response } from "express";
import morgan from "morgan";

import Routes from "./routes/Routes";

const app: Application = express();

app.use(morgan("tiny"));

app.use(Routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running in http://localhost:${PORT}`);
});
