import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { client } from "../config/typesense.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, "../data/products.json");
const raw = fs.readFileSync(dataPath, "utf-8");
const data = JSON.parse(raw);

const schema = {
  name: "products",
  fields: [
    { name: "id", type: "string" },
    { name: "legacy_id", type: "int32" },
    { name: "name", type: "string" },
    { name: "slug", type: "string", optional: true },
    { name: "sales", type: "float" },
    { name: "default_image", type: "string", optional: true },
  ],
  default_sorting_field: "sales",
};

async function run() {
  try {
    await client.collections("products").delete();
  } catch (error) {
    // collection may not exist yet
  }

  await client.collections().create(schema);

  const formatted = data.map((p) => ({
    id: String(p.legacy_id),
    legacy_id: Number(p.legacy_id),
    name: p.name || "",
    slug: p.slug || "",
    sales: Number(p.sales) || 0,
    default_image: p.default_image || "",
  }));

  await client.collections("products").documents().import(formatted, {
    action: "upsert",
  });

  console.log("✅ Data Indexed");
}

run();