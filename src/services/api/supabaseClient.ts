import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

async function proxyFetch(input: RequestInfo | URL, init?: RequestInit) {
  if (typeof window === "undefined") {
    return fetch(input, init);
  }

  const request = input instanceof Request ? input : new Request(input, init);
  const headersObject: Record<string, string> = {};

  request.headers.forEach((value, key) => {
    headersObject[key] = value;
  });

  let body: string | null = null;
  let bodyEncoding: "text" | "base64" | null = null;

  if (request.method !== "GET" && request.method !== "HEAD") {
    const rawBody = await request.arrayBuffer();

    if (rawBody.byteLength > 0) {
      const bytes = new Uint8Array(rawBody);
      let binary = "";
      for (let index = 0; index < bytes.length; index += 1) {
        binary += String.fromCharCode(bytes[index]);
      }
      body = btoa(binary);
      bodyEncoding = "base64";
    }
  }

  const proxyResponse = await fetch("/api/supabase-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: request.url,
      method: request.method,
      headers: headersObject,
      body,
      bodyEncoding
    })
  });

  const responseBody = await proxyResponse.arrayBuffer();
  return new Response(responseBody, {
    status: proxyResponse.status,
    statusText: proxyResponse.statusText,
    headers: proxyResponse.headers
  });
}

export const supabase = createClient(supabaseUrl, supabasePublicKey, {
  global: {
    fetch: proxyFetch
  }
});
