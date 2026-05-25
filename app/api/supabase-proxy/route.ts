import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ProxyPayload = {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string | null;
  bodyEncoding?: "text" | "base64" | null;
};

function decodeBody(payload: ProxyPayload) {
  if (!payload.body) {
    return undefined;
  }

  if (payload.bodyEncoding === "base64") {
    return Buffer.from(payload.body, "base64");
  }

  return payload.body;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ProxyPayload;

    if (!payload.url || !payload.url.startsWith("http")) {
      return NextResponse.json({ message: "Invalid proxy target URL" }, { status: 400 });
    }

    const upstreamHeaders = new Headers(payload.headers || {});

    upstreamHeaders.delete("host");
    upstreamHeaders.delete("content-length");
    upstreamHeaders.delete("origin");
    upstreamHeaders.delete("referer");

    const upstreamResponse = await fetch(payload.url, {
      method: payload.method || "GET",
      headers: upstreamHeaders,
      body: decodeBody(payload)
    });

    const responseHeaders = new Headers();
    upstreamResponse.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Proxy request failed"
      },
      { status: 500 }
    );
  }
}
