import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST() {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      throw new Error("Supabase server configuration missing.");
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

    const { data, error } = await supabaseAdmin.rpc(
      "select_giveaway_winner"
    );

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      winnerId: data,
    });
  } catch (error) {
    console.error("Winner selection API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Winner selection failed.",
      },
      { status: 500 }
    );
  }
}
