import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { method, amount } = body as {
      method?: string;
      amount?: number;
    };

    if (!method || typeof method !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing payment method" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Yahan future me real JazzCash / Easypaisa integration aa sakti hai.
    // Abhi ke liye ye sirf demo response hai.
    return NextResponse.json({
      ok: true,
      mode: "demo",
      provider: method,
      amount
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

