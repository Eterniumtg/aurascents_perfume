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
    const buildHookUrl = Netlify.env.get("BUILD_HOOK_URL");

    if (!buildHookUrl) {
      return new Response(JSON.stringify({
        error: "BUILD_HOOK_URL environment variable not configured"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Trigger Netlify build hook
    const response = await fetch(buildHookUrl, {
      method: "POST",
      body: JSON.stringify({ trigger: "admin-product-update" })
    });

    if (!response.ok) {
      throw new Error(`Build hook request failed: ${response.status}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Deploy triggered successfully"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error triggering deploy:", error);
    return new Response(JSON.stringify({ error: "Failed to trigger deploy" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config: Config = {
  path: "/api/trigger-deploy"
};
