import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonResponse(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request) {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error("Missing Supabase server configuration.");

      return jsonResponse(
        {
          success: false,
          error: "Server configuration error.",
        },
        500
      );
    }

    // Check that the request originates from the same website.
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (!origin || !host) {
      return jsonResponse(
        {
          success: false,
          error: "Request origin could not be verified.",
        },
        403
      );
    }

    let requestOrigin;

    try {
      requestOrigin = new URL(origin);
    } catch {
      return jsonResponse(
        {
          success: false,
          error: "Invalid request origin.",
        },
        403
      );
    }

    if (requestOrigin.host !== host) {
      return jsonResponse(
        {
          success: false,
          error: "Request origin not allowed.",
        },
        403
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // The database function performs the actual winner selection.
    const { data, error } = await supabaseAdmin.rpc(
      "select_giveaway_winner"
    );

    if (error) {
      console.error("Supabase winner selection error:", error);

      return jsonResponse(
        {
          success: false,
          error: "Winner selection failed. Check server logs.",
        },
        500
      );
    }

    if (data == null) {
      return jsonResponse(
        {
          success: false,
          error: "No winner was returned.",
        },
        500
      );
    }

    return jsonResponse({
      success: true,
      winnerId: data,
    });
  } catch (error) {
    console.error("Winner selection API error:", error);

    return jsonResponse(
      {
        success: false,
        error: "Unexpected winner selection error.",
      },
      500
    );
  }
}
