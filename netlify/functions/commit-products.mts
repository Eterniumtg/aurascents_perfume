import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await req.json();
    const products = body.products;
    const owner = body.owner || process.env.GITHUB_OWNER;
    const repo = body.repo || process.env.GITHUB_REPO;

    // Basic auth using an admin password header
    const headerPassword = req.headers.get("x-admin-password") || req.headers.get("X-Admin-Password");
    const ADMIN_PW = process.env.ADMIN_PASSWORD || "aurascents2026"; // fallback if not set

    if (!headerPassword || headerPassword !== ADMIN_PW) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!Array.isArray(products)) {
      return new Response(JSON.stringify({ error: "Products must be an array" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!owner || !repo) {
      return new Response(JSON.stringify({ error: "Repository owner/repo not provided or configured" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const path = "data/products.json";
    const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    // Get token from environment (recommended) or Netlify env API
    const GITHUB_PAT = process.env.GITHUB_PAT || (typeof (globalThis as any).Netlify !== 'undefined' ? (globalThis as any).Netlify?.env?.get("GITHUB_PAT") : undefined);

    if (!GITHUB_PAT) {
      return new Response(JSON.stringify({ error: "Server not configured: missing GITHUB_PAT environment variable" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get existing file to find sha (if any)
    let sha;
    const getRes = await fetch(apiBase, {
      headers: { Accept: "application/vnd.github+json", Authorization: `token ${GITHUB_PAT}` }
    });

    if (getRes.ok) {
      const j = await getRes.json();
      sha = j.sha;
    } else if (getRes.status !== 404) {
      const j = await getRes.text();
      console.error("Unexpected response getting file:", getRes.status, j);
      return new Response(JSON.stringify({ error: "Failed to check existing file" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const contentStr = JSON.stringify(products, null, 2);
    const contentB64 = Buffer.from(contentStr, "utf8").toString("base64");

    const putBody: any = {
      message: "Update products via admin panel (server)",
      content: contentB64
    };
    if (sha) putBody.sha = sha;

    const putRes = await fetch(apiBase, {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `token ${GITHUB_PAT}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(putBody)
    });

    if (!putRes.ok) {
      const err = await putRes.text().catch(() => "");
      console.error("GitHub commit failed:", putRes.status, err);
      return new Response(JSON.stringify({ error: "Failed to commit to repository" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Attempt to trigger a repository_dispatch event so GitHub Actions can run securely
    try {
      const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/dispatches`;
      const dispatchRes = await fetch(dispatchUrl, {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `token ${GITHUB_PAT}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ event_type: "admin_products_updated", client_payload: { via: "commit-products" } })
      });

      if (!dispatchRes.ok) {
        const dErr = await dispatchRes.text().catch(() => "");
        console.warn("Repository dispatch failed:", dispatchRes.status, dErr);
      } else {
        console.log("Repository dispatch event sent successfully")
      }
    } catch (dispatchError) {
      console.error("Error sending repository dispatch:", dispatchError);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in commit-products function:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config: Config = {
  path: "/api/commit-products"
};
