// import express from "express";
// import { client } from "../config/typesense.js";

// const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const q = (req.query.q || "").trim();

//     const results = await client
//       .collections("products")
//       .documents()
//       .search({
//         q: q || "*",
//         query_by: "name,slug",
//         prefix: true,
//         num_typos: 2,
//         prioritize_exact_match: true,
//         sort_by: "_text_match:desc,sales:desc",
//         per_page: 10,
//       });

//     res.json(results);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;

import express from "express";
import { searchProducts } from "../controllers/search.controller.js";

const searchRouter=express.Router();

searchRouter.get("/",searchProducts);

export default searchRouter;