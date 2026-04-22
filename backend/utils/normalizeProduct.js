import crypto from "crypto";
import { slugify } from "./slugify.js";

export function normalizeProduct(item = {}) {
  const name = String(item.name || "").trim();

  return {
    id: String(item.id || item.legacy_id || crypto.randomUUID()),
    legacy_id: Number(item.legacy_id || 0),
    name,
    slug: item.slug ? String(item.slug).trim() : `/${slugify(name)}`,
    sales: Number(item.sales ?? 0) || 0,
    default_image: String(item.default_image || "").trim(),
  };
}