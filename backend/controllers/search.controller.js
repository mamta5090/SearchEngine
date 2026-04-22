import { client } from "../config/typesense.js";

export async function searchProducts(req, res) {
    try{
        const q=(req.query.q || "").trim();
        if(!q){
            return res.json({hits:[]});
        }
        const results=await client
        .collections("products")
        .documents()
        .search({
            q,
            query_by:"name,slug",
            prefix:true,
            num_typos:2,
            prioritize_exact_match:true,
            sort_by: "_text_match:desc,sales:desc",
        per_page: 10,
      });

    return res.json(results);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}