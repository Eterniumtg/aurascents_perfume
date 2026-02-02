import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const products = await req.json();

    // Validate that products is an array
    if (!Array.isArray(products)) {
      return new Response(JSON.stringify({ error: "Products must be an array" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const store = getStore("products");
    await store.setJSON("all-products", products);

    return new Response(JSON.stringify({ success: true, count: products.length }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error saving products:", error);
    return new Response(JSON.stringify({ error: "Failed to save products" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config: Config = {
  path: "/api/products"
};
