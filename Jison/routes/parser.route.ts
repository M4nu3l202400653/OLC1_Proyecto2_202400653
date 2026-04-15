import { Router } from "express";
import { analizar } from "../controllers/parser.controller.v2";

const router = Router();

router.post("/analizar", analizar);

export default router;
