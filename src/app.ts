import express, { Request, Response } from "express";
import pinoHttp from "pino-http";

const app = express();
const logger = pinoHttp();

app.use(logger);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
