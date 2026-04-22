import path from "path";
import { parse } from "csv-parse/sync";
import { client } from "../config/typesense.js";
import { normalizeProduct } from "../utils/normalizeProduct.js";

const schema = {
  name: "products",
  fields: [
    { name: "id", type: "string" },
    { name: "legacy_id", type: "int32", optional: true },
    { name: "name", type: "string" },
    { name: "slug", type: "string", optional: true },
    { name: "sales", type: "float", optional: true },
    { name: "default_image", type: "string", optional: true },
  ],
  default_sorting_field: "sales",
};

export async function ensureCollection() {
  try {
    await client.collections("products").retrieve();
  } catch {
    await client.collections().create(schema);
  }
}

export async function addProduct(req, res) {
  try {
    const product = normalizeProduct(req.body);

    if (!product.name) {
      return res.status(400).json({ message: "Name is required" });
    }

    await ensureCollection();
    await client.collections("products").documents().upsert(product);

    return res.json({
      message: "Product saved successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save product",
      error: error.message,
    });
  }
}

export async function importProducts(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    await ensureCollection();

    const ext = path.extname(req.file.originalname).toLowerCase();
    let items = [];

    if (ext === ".json") {
      const parsed = JSON.parse(req.file.buffer.toString("utf-8"));
      items = Array.isArray(parsed) ? parsed : [parsed];
    } else if (ext === ".csv") {
      items = parse(req.file.buffer.toString("utf-8"), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } else {
      return res.status(400).json({
        message: "Only .json or .csv files are supported",
      });
    }

    const docs = items.map(normalizeProduct).filter((item) => item.name);

    await client.collections("products").documents().import(docs, {
      action: "upsert",
    });

    return res.json({
      message: "File imported successfully",
      count: docs.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Import failed",
      error: error.message,
    });
  }
}