import express from "express";
import multer from "multer";
import { addProduct, importProducts } from "../controllers/product.controller.js";

const productRouter=express.Router();
const upload=multer({storage:multer.memoryStorage()});

productRouter.post("/manual",addProduct);
productRouter.post("/import",upload.single("file"),importProducts);

export default productRouter;