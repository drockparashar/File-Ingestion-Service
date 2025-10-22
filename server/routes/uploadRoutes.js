import express from "express";
import { uploadHandler } from "../controllers/uploadController.js";

const router=express.Router();

router.post("",uploadHandler)

export default router;