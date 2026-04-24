import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";

import parserRouter from "../routes/parser.route";

dotenv.config();

export class Server {
  public app: Application;
  public port: number;

  private parserPath = "/api/parser";
 

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 8001;

    this.middlewares();
    this.routes();
  }

  private middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private routes() {
    this.app.use(this.parserPath, parserRouter);
  }

  public async listen() {
    this.app.listen(this.port, async () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}
