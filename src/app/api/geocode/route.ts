import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return new Response(JSON.stringify({ error: "lat/lng required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
      const res = await fetch(url);
      const data = (await res.json()) as {
        results?: { formatted_address?: string }[];
        status?: string;
      };
      if (data.status === "OK" && data.results?.[0]?.formatted_address) {
        return new Response(
          JSON.stringify({ address: data.results[0].formatted_address }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } catch (err) {
      console.error("Geocode error:", err);
    }
  }

  const address = `Approx location: (${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)})`;
  return new Response(JSON.stringify({ address }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

